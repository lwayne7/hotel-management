import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createE2EApp, seedE2EData, type E2ESeedResult } from './helpers/e2e-app';

describe('Orders & Payments flow (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let dataSource: DataSource;
  let seeded: E2ESeedResult;

  beforeAll(async () => {
    ({ app, dataSource } = await createE2EApp());
    server = app.getHttpServer();
    seeded = await seedE2EData(app, dataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should create order, pay by callback and see it in my orders', async () => {
    const createOrderRes = await request(server)
      .post('/api/orders')
      .set('Authorization', `Bearer ${seeded.customerToken}`)
      .send({
        hotelId: seeded.hotelId,
        roomTypeId: seeded.roomTypeId,
        checkInDate: seeded.checkInDate,
        checkOutDate: seeded.checkOutDate,
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

    const myOrdersRes = await request(server)
      .get('/api/orders/mine')
      .set('Authorization', `Bearer ${seeded.customerToken}`)
      .expect(200);

    const order = (myOrdersRes.body.data as any[]).find((o) => o.id === orderId);
    expect(order).toBeDefined();
    expect(order.status).toBe('paid');
  });
});
