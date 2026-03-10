import { DataSource, Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './order.entity';
import { Hotel, HotelStatus } from '../hotels/entities/hotel.entity';
import { RoomType } from '../hotels/entities/room-type.entity';
import { RoomInventory } from '../inventory/room-inventory.entity';
import { InventoryService } from '../inventory/inventory.service';

type MockEntityManager = {
  getRepository: (entity: unknown) => unknown;
};

/**
 * 并发场景测试：两个用户同时抢最后一间房。
 *
 * 当使用 SQLite 时无法开启 pessimistic_write 锁，因此：
 * - 本测试验证的是 InventoryService 的库存不足拒绝逻辑
 * - 使用 Postgres 时可验证悲观锁行为
 */
describe('OrdersService - Concurrency', () => {
  let ordersService: OrdersService;
  let mockDataSource: Partial<DataSource>;
  let mockOrdersRepo: Partial<Repository<Order>>;
  let inventoryService: InventoryService;

  const HOTEL_ID = 1;
  const ROOM_TYPE_ID = 1;
  const CHECK_IN = '2026-04-01';
  const CHECK_OUT = '2026-04-02';

  const mockHotel: Partial<Hotel> = {
    id: HOTEL_ID,
    status: HotelStatus.APPROVED,
    nameCn: '测试酒店',
    merchantId: 100,
  };

  const mockRoomType: Partial<RoomType> = {
    id: ROOM_TYPE_ID,
    hotelId: HOTEL_ID,
    price: 200,
    maxGuests: 2,
  };

  // 模拟仅剩 1 间库存
  let inventoryRow: RoomInventory;

  const createDto = {
    hotelId: HOTEL_ID,
    roomTypeId: ROOM_TYPE_ID,
    checkInDate: CHECK_IN,
    checkOutDate: CHECK_OUT,
    rooms: 1,
    guests: 1,
  };

  let orderIdCounter = 1;

  beforeEach(() => {
    inventoryRow = {
      id: 1,
      roomTypeId: ROOM_TYPE_ID,
      date: CHECK_IN,
      total: 1,
      reserved: 0,
      sold: 0,
    } as RoomInventory;

    orderIdCounter = 1;

    const mockManager: MockEntityManager = {
      getRepository: (entity: unknown) => {
        if (entity === Hotel) {
          return { findOne: jest.fn().mockResolvedValue(mockHotel) };
        }
        if (entity === RoomType) {
          return { findOne: jest.fn().mockResolvedValue(mockRoomType) };
        }
        if (entity === RoomInventory) {
          return {
            createQueryBuilder: () => {
              const builder: Record<string, any> = {
                where: function () {
                  return this;
                },
                andWhere: function () {
                  return this;
                },
                setLock: function () {
                  return this;
                },
                getMany: jest.fn().mockResolvedValue([inventoryRow]),
                // 原子 SQL UPDATE 链
                update: function () {
                  return this;
                },
                set: function (setter: Record<string, any>) {
                  (this as any)._setter = setter;
                  return this;
                },
                execute: jest.fn(async () => {
                  // 从 setter 提取增量值
                  const setterFn = (builder as any)._setter?.reserved;
                  let qty = 1;
                  if (typeof setterFn === 'function') {
                    const expr = setterFn();
                    const match = expr.match(/[+-] (\d+)/);
                    if (match) qty = parseInt(match[1], 10);
                  }
                  // 模拟原子 SQL：检查 available >= qty
                  const available =
                    inventoryRow.total -
                    inventoryRow.reserved -
                    inventoryRow.sold;
                  if (available >= qty) {
                    inventoryRow.reserved += qty;
                    return { affected: 1 };
                  }
                  return { affected: 0 };
                }),
              };
              return builder;
            },
            save: jest.fn(async (rows: RoomInventory[]) => rows),
          };
        }
        if (entity === Order) {
          return {
            create: jest.fn((data: Record<string, unknown>) => ({
              ...data,
              id: orderIdCounter++,
            })),
            save: jest.fn(async (order: Record<string, unknown>) => order),
          };
        }
        return {};
      },
    };

    const transaction: DataSource['transaction'] = async <T>(
      isolationOrRunInTransaction:
        | ((entityManager: never) => Promise<T>)
        | string,
      maybeRunInTransaction?: (entityManager: never) => Promise<T>,
    ): Promise<T> => {
      const runInTransaction =
        typeof isolationOrRunInTransaction === 'function'
          ? isolationOrRunInTransaction
          : maybeRunInTransaction;

      if (!runInTransaction) {
        throw new Error('transaction callback is required');
      }

      return runInTransaction(mockManager as never);
    };

    // 模拟 DataSource.transaction：串行执行回调但共享 inventoryRow
    mockDataSource = {
      options: { type: 'better-sqlite3' } as any,
      transaction,
    };

    mockOrdersRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
    };

    const mockNotificationsGateway = {
      sendNotification: jest.fn(),
    };

    inventoryService = new InventoryService();

    ordersService = new OrdersService(
      mockDataSource as DataSource,
      mockOrdersRepo as Repository<Order>,
      inventoryService,
      mockNotificationsGateway as any,
    );
  });

  it('第一个用户下单成功', async () => {
    const result = await ordersService.createOrder(1, createDto);
    expect(result).toBeDefined();
    expect(result.status).toBe(OrderStatus.PENDING_PAYMENT);
    // 下单后 reserved 应该 +1
    expect(inventoryRow.reserved).toBe(1);
  });

  it('两个用户先后抢最后一间房，第二个应被拒绝', async () => {
    // 第一个用户下单成功
    await ordersService.createOrder(1, createDto);
    expect(inventoryRow.reserved).toBe(1);

    // 第二个用户下单应失败（库存不足）
    await expect(ordersService.createOrder(2, createDto)).rejects.toThrow(
      '库存不足',
    );
  });

  it('用户预定 2 间但库存只有 1 间，应被拒绝', async () => {
    await expect(
      ordersService.createOrder(1, { ...createDto, rooms: 2 }),
    ).rejects.toThrow('库存不足');
    // 库存未被扣减
    expect(inventoryRow.reserved).toBe(0);
  });
});
