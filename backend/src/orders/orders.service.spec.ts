import { DataSource } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './order.entity';
import { InventoryService } from '../inventory/inventory.service';
import { RoomInventory } from '../inventory/room-inventory.entity';
import { Hotel, HotelStatus } from '../hotels/entities/hotel.entity';
import { RoomType } from '../hotels/entities/room-type.entity';
import { HotelImage } from '../hotels/entities/hotel-image.entity';
import { User, UserRole } from '../users/entities/user.entity';

describe('OrdersService (business closure)', () => {
  let ds: DataSource;
  let ordersService: OrdersService;

  beforeAll(async () => {
    ds = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [Order, RoomInventory, Hotel, RoomType, HotelImage, User],
      synchronize: true,
      logging: false,
    });
    await ds.initialize();

    const inventoryService = new InventoryService();
    const notificationsGateway = { sendNotification: () => {} } as any;
    ordersService = new OrdersService(
      ds,
      ds.getRepository(Order),
      inventoryService,
      notificationsGateway,
    );

    await ds.getRepository(User).save({
      id: 100,
      username: 'merchant_test',
      password: 'x',
      role: UserRole.MERCHANT,
      nickname: '商户',
      phone: '13800000000',
    } as any);

    await ds.getRepository(Hotel).save({
      id: 1,
      nameCn: '测试酒店',
      nameEn: 'Test Hotel',
      address: 'Test Address',
      starRating: 5,
      openingDate: new Date('2020-01-01'),
      description: 'desc',
      facilities: [],
      nearbyAttractions: [],
      transportation: [],
      status: HotelStatus.APPROVED,
      rejectReason: null,
      merchantId: 100,
    } as any);

    await ds.getRepository(RoomType).save({
      id: 101,
      name: '大床房',
      price: 100,
      originalPrice: 120,
      discountType: 'none',
      discountValue: null,
      discountDescription: null,
      maxGuests: 2,
      bedType: '1.8m',
      roomSize: 30,
      amenities: [],
      imageUrl: null,
      description: null,
      hotelId: 1,
    } as any);

    // 2 晚库存：03-10、03-11
    await ds.getRepository(RoomInventory).save([
      { roomTypeId: 101, date: '2026-03-10', total: 1, reserved: 0, sold: 0 } as any,
      { roomTypeId: 101, date: '2026-03-11', total: 1, reserved: 0, sold: 0 } as any,
    ]);
  });

  afterAll(async () => {
    if (ds.isInitialized) await ds.destroy();
  });

  it('should reject when inventory is insufficient', async () => {
    await expect(
      ordersService.createOrder(200, {
        hotelId: 1,
        roomTypeId: 101,
        checkInDate: '2026-03-10',
        checkOutDate: '2026-03-12',
        rooms: 2,
        guests: 2,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should commit inventory once even if confirmPaid called twice', async () => {
    const order = await ordersService.createOrder(201, {
      hotelId: 1,
      roomTypeId: 101,
      checkInDate: '2026-03-10',
      checkOutDate: '2026-03-12',
      rooms: 1,
      guests: 2,
    });

    const invRepo = ds.getRepository(RoomInventory);
    const before = await invRepo.find({ where: { roomTypeId: 101 } as any, order: { date: 'ASC' } as any });
    expect(before.map((r) => r.reserved)).toEqual([1, 1]);

    const paid1 = await ordersService.confirmPaidByCallback({
      orderId: order.id,
      eventId: 'evt_1',
      paidAt: new Date('2026-03-09T00:00:00.000Z'),
    });
    expect(paid1.status).toBe(OrderStatus.PAID);

    const after1 = await invRepo.find({ where: { roomTypeId: 101 } as any, order: { date: 'ASC' } as any });
    expect(after1.map((r) => r.reserved)).toEqual([0, 0]);
    expect(after1.map((r) => r.sold)).toEqual([1, 1]);

    const paid2 = await ordersService.confirmPaidByCallback({
      orderId: order.id,
      eventId: 'evt_2',
    });
    expect(paid2.status).toBe(OrderStatus.PAID);

    const after2 = await invRepo.find({ where: { roomTypeId: 101 } as any, order: { date: 'ASC' } as any });
    expect(after2.map((r) => r.sold)).toEqual([1, 1]);
  });

  it('should release inventory on cancel', async () => {
    // 先补一晚库存（避免被上个用例消耗）
    const invRepo = ds.getRepository(RoomInventory);
    await invRepo.update({ roomTypeId: 101, date: '2026-03-10' } as any, { total: 2, reserved: 0, sold: 0 } as any);
    await invRepo.update({ roomTypeId: 101, date: '2026-03-11' } as any, { total: 2, reserved: 0, sold: 0 } as any);

    const order = await ordersService.createOrder(202, {
      hotelId: 1,
      roomTypeId: 101,
      checkInDate: '2026-03-10',
      checkOutDate: '2026-03-12',
      rooms: 1,
      guests: 2,
    });
    const cancelled = await ordersService.cancelOrder(202, order.id);
    expect(cancelled.status).toBe(OrderStatus.CANCELLED);

    const inv = await invRepo.find({ where: { roomTypeId: 101 } as any, order: { date: 'ASC' } as any });
    expect(inv.map((r) => r.reserved)).toEqual([0, 0]);
  });

  it('should allow deleting non-pending orders only', async () => {
    const order = await ordersService.createOrder(203, {
      hotelId: 1,
      roomTypeId: 101,
      checkInDate: '2026-03-10',
      checkOutDate: '2026-03-12',
      rooms: 1,
      guests: 2,
    });
    // 待支付时不允许删除
    await expect(ordersService.deleteOrder(203, order.id)).rejects.toBeInstanceOf(ForbiddenException);

    // 取消后可以删除
    await ordersService.cancelOrder(203, order.id);
    await expect(ordersService.deleteOrder(203, order.id)).resolves.toBeUndefined();
    const left = await ds.getRepository(Order).findOne({ where: { id: order.id } });
    expect(left).toBeNull();
  });
});

