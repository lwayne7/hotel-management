import { DataSource } from 'typeorm';
import { PaymentsService } from './payments.service';
import { PaymentEvent } from './payment-event.entity';
import { OrdersService } from '../orders/orders.service';
import { InventoryService } from '../inventory/inventory.service';
import { Order, OrderStatus } from '../orders/order.entity';
import { RoomInventory } from '../inventory/room-inventory.entity';
import { Hotel, HotelStatus } from '../hotels/entities/hotel.entity';
import { RoomType } from '../hotels/entities/room-type.entity';
import { HotelImage } from '../hotels/entities/hotel-image.entity';
import { User, UserRole } from '../users/entities/user.entity';

describe('PaymentsService (idempotency)', () => {
  let ds: DataSource;
  let paymentsService: PaymentsService;
  let ordersService: OrdersService;

  beforeAll(async () => {
    ds = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [PaymentEvent, Order, RoomInventory, Hotel, RoomType, HotelImage, User],
      synchronize: true,
      logging: false,
    });
    await ds.initialize();

    const inventoryService = new InventoryService();
    const notificationsGateway = { sendNotification: () => { } } as any;
    ordersService = new OrdersService(
      ds,
      ds.getRepository(Order),
      inventoryService,
      notificationsGateway,
    );
    paymentsService = new PaymentsService(ds, ds.getRepository(PaymentEvent), ordersService);

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

    await ds.getRepository(RoomInventory).save([
      { roomTypeId: 101, date: '2026-03-10', total: 2, reserved: 0, sold: 0 } as any,
      { roomTypeId: 101, date: '2026-03-11', total: 2, reserved: 0, sold: 0 } as any,
    ]);
  });

  afterAll(async () => {
    if (ds.isInitialized) await ds.destroy();
  });

  it('should be idempotent on repeated callback eventId', async () => {
    const order = await ordersService.createOrder(301, {
      hotelId: 1,
      roomTypeId: 101,
      checkInDate: '2026-03-10',
      checkOutDate: '2026-03-12',
      rooms: 1,
      guests: 2,
    });

    const r1 = await paymentsService.handleCallback({
      eventId: 'evt_repeat',
      orderId: order.id,
      paymentNo: 'pay_001',
      paidAt: '2026-03-09T12:00:00.000Z',
    });
    expect(r1.ok).toBe(true);
    expect(r1.idempotent).toBe(false);
    expect((r1 as any).order.status).toBe(OrderStatus.PAID);

    const r2 = await paymentsService.handleCallback({
      eventId: 'evt_repeat',
      orderId: order.id,
      paymentNo: 'pay_001',
      paidAt: '2026-03-09T12:00:00.000Z',
    });
    expect(r2.ok).toBe(true);
    expect(r2.idempotent).toBe(true);
  });
});

