import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.bootstrap';
import { User, UserRole } from '../../src/users/entities/user.entity';
import { Hotel, HotelStatus } from '../../src/hotels/entities/hotel.entity';
import { DiscountType, RoomType } from '../../src/hotels/entities/room-type.entity';
import { RoomInventory } from '../../src/inventory/room-inventory.entity';

export interface E2ESeedResult {
  customerToken: string;
  merchantId: number;
  adminId: number;
  customerId: number;
  hotelId: number;
  roomTypeId: number;
  checkInDate: string;
  checkOutDate: string;
}

function applyE2EEnv() {
  process.env.NODE_ENV = 'test';
  process.env.DB_TYPE = 'sqlite';
  process.env.DB_DATABASE = ':memory:';
  process.env.JWT_SECRET = 'e2e_test_secret';
  delete process.env.DATABASE_URL;
}

function addDays(base: Date, offset: number) {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + offset);
  return next.toISOString().slice(0, 10);
}

export async function createE2EApp() {
  applyE2EEnv();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  configureApp(app);
  await app.init();

  return {
    app,
    dataSource: app.get(DataSource),
  };
}

export async function seedE2EData(
  app: INestApplication,
  dataSource: DataSource,
): Promise<E2ESeedResult> {
  const userRepository = dataSource.getRepository(User);
  const hotelRepository = dataSource.getRepository(Hotel);
  const roomTypeRepository = dataSource.getRepository(RoomType);
  const inventoryRepository = dataSource.getRepository(RoomInventory);

  const password = await bcrypt.hash('Test123456', 10);
  const merchant = await userRepository.save({
    username: 'merchant_e2e',
    password,
    role: UserRole.MERCHANT,
    nickname: 'E2E 商户',
    phone: '13800138000',
  } as User);
  const admin = await userRepository.save({
    username: 'admin_e2e',
    password,
    role: UserRole.ADMIN,
    nickname: 'E2E 管理员',
    phone: '13900139000',
  } as User);
  const customer = await userRepository.save({
    username: 'customer_e2e',
    password,
    role: UserRole.CUSTOMER,
    nickname: 'E2E 用户',
    phone: '13700137000',
  } as User);

  const hotel = await hotelRepository.save({
    nameCn: 'E2E 测试酒店',
    nameEn: 'E2E Hotel',
    address: '上海市浦东新区测试路 1 号',
    starRating: 4,
    openingDate: new Date('2020-01-01'),
    description: '用于 E2E 测试的酒店',
    facilities: ['免费WiFi', '健身房'],
    nearbyAttractions: ['测试景点'],
    transportation: ['地铁 2 号线'],
    status: HotelStatus.APPROVED,
    rejectReason: null,
    merchantId: merchant.id,
  } as Hotel);

  const roomTypeData: Partial<RoomType> = {
    name: '高级大床房',
    price: 399,
    originalPrice: 499,
    discountType: DiscountType.NONE,
    maxGuests: 2,
    bedType: '1.8m 大床',
    roomSize: 32,
    amenities: ['空调'],
    description: 'E2E 房型',
    hotelId: hotel.id,
  };
  const roomType = await roomTypeRepository.save(
    roomTypeRepository.create(roomTypeData),
  );

  const today = new Date();
  const start = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const checkInDate = addDays(start, 1);
  const checkOutDate = addDays(start, 2);

  await inventoryRepository.save([
    {
      roomTypeId: roomType.id,
      date: checkInDate,
      total: 5,
      reserved: 0,
      sold: 0,
    } as RoomInventory,
  ]);

  const loginRes = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ username: customer.username, password: 'Test123456' })
    .expect(200);

  return {
    customerToken: loginRes.body.access_token as string,
    merchantId: merchant.id,
    adminId: admin.id,
    customerId: customer.id,
    hotelId: hotel.id,
    roomTypeId: roomType.id,
    checkInDate,
    checkOutDate,
  };
}
