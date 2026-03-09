import { DataSource, Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './order.entity';
import { Hotel, HotelStatus } from '../hotels/entities/hotel.entity';
import { RoomType } from '../hotels/entities/room-type.entity';
import { RoomInventory } from '../inventory/room-inventory.entity';
import { InventoryService } from '../inventory/inventory.service';

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

    // 模拟 DataSource.transaction：串行执行回调但共享 inventoryRow
    mockDataSource = {
      options: { type: 'better-sqlite3' } as any,
      transaction: jest.fn(async (cb: (manager: any) => Promise<any>) => {
        const mockManager = {
          getRepository: (entity: any) => {
            if (entity === Hotel) {
              return { findOne: jest.fn().mockResolvedValue(mockHotel) };
            }
            if (entity === RoomType) {
              return { findOne: jest.fn().mockResolvedValue(mockRoomType) };
            }
            if (entity === RoomInventory) {
              return {
                createQueryBuilder: () => ({
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
                }),
                save: jest.fn(async (rows: RoomInventory[]) => rows),
              };
            }
            if (entity === Order) {
              return {
                create: jest.fn((data: any) => ({
                  ...data,
                  id: orderIdCounter++,
                })),
                save: jest.fn(async (order: any) => order),
              };
            }
            return {};
          },
        };
        return cb(mockManager);
      }),
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
