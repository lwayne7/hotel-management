import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Orders & Payments flow (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create order, pay by callback and see it in my orders', async () => {
    // 1) 登录获取 customer token（使用种子用户）
    const loginRes = await request(server)
      .post('/api/auth/login')
      .send({ username: 'customer01', password: 'Cust123456' })
      .expect(200);

    const token = loginRes.body?.accessToken as string;
    expect(token).toBeDefined();

    // 2) 创建订单
    const createOrderRes = await request(server)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hotelId: 1,
        roomTypeId: 1,
        checkInDate: '2026-03-10',
        checkOutDate: '2026-03-11',
        rooms: 1,
        guests: 1,
      })
      .expect(201);

    const orderId = createOrderRes.body.id as number;
    expect(orderId).toBeGreaterThan(0);

    // 3) 模拟支付回调
    const eventId = `evt_test_${Date.now()}`;
    await request(server)
      .post('/api/payments/callback')
      .send({
        eventId,
        orderId,
        paymentNo: `pay_${orderId}`,
      })
      .expect(201);

    // 4) 查询“我的订单”，校验订单已处于 PAID
    const myOrdersRes = await request(server)
      .get('/api/orders/mine')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const order = (myOrdersRes.body.data as any[]).find((o) => o.id === orderId);
    expect(order).toBeDefined();
    expect(order.status).toBe('PAID');
  });
});

