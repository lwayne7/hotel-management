import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 初始化数据库 schema —— 基于所有 Entity 定义手动编写。
 *
 * 开发环境使用 synchronize: true 自动同步；
 * 生产环境必须通过 migration:run 执行本迁移，保证 schema 变更安全可回滚。
 *
 * 仅支持 PostgreSQL（生产数据库）。
 */
export class InitialSchema1711000000000 implements MigrationInterface {
  name = 'InitialSchema1711000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========== users ==========
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" varchar(50) NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "role" varchar(20) NOT NULL DEFAULT 'merchant',
        "nickname" varchar(100),
        "phone" varchar(20),
        "tokenVersion" int NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ========== hotels ==========
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "hotels" (
        "id" SERIAL PRIMARY KEY,
        "nameCn" varchar(100) NOT NULL,
        "nameEn" varchar(100),
        "address" varchar(255) NOT NULL,
        "starRating" int NOT NULL DEFAULT 3,
        "openingDate" date,
        "description" text,
        "facilities" text,
        "nearbyAttractions" text,
        "transportation" text,
        "status" varchar(20) NOT NULL DEFAULT 'draft',
        "rejectReason" text,
        "merchantId" int NOT NULL REFERENCES "users"("id"),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_hotels_status_updatedAt" ON "hotels" ("status", "updatedAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_hotels_merchantId_status" ON "hotels" ("merchantId", "status")`,
    );

    // ========== room_types ==========
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "room_types" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar(50) NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "originalPrice" decimal(10,2),
        "discountType" varchar(20) NOT NULL DEFAULT 'none',
        "discountValue" decimal(5,2),
        "discountDescription" text,
        "maxGuests" int NOT NULL DEFAULT 2,
        "bedType" text,
        "roomSize" int,
        "amenities" text,
        "imageUrl" text,
        "description" text,
        "hotelId" int NOT NULL REFERENCES "hotels"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_room_types_hotelId_price" ON "room_types" ("hotelId", "price")`,
    );

    // ========== hotel_images ==========
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "hotel_images" (
        "id" SERIAL PRIMARY KEY,
        "imageUrl" varchar(500) NOT NULL,
        "sortOrder" int NOT NULL DEFAULT 0,
        "description" varchar(100),
        "hotelId" int NOT NULL REFERENCES "hotels"("id") ON DELETE CASCADE
      )
    `);

    // ========== orders ==========
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" SERIAL PRIMARY KEY,
        "orderNo" varchar(40) NOT NULL,
        "userId" int NOT NULL,
        "hotelId" int NOT NULL,
        "roomTypeId" int NOT NULL,
        "checkInDate" date NOT NULL,
        "checkOutDate" date NOT NULL,
        "rooms" int NOT NULL DEFAULT 1,
        "guests" int NOT NULL DEFAULT 1,
        "amountCents" int NOT NULL,
        "status" varchar(30) NOT NULL DEFAULT 'pending_payment',
        "paidAt" bigint,
        "cancelledAt" bigint,
        "expiredAt" bigint,
        "expiresAt" bigint NOT NULL,
        "paymentEventId" varchar(80),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_orders_orderNo" ON "orders" ("orderNo")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_orders_status_expiresAt" ON "orders" ("status", "expiresAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_orders_userId" ON "orders" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_orders_hotelId" ON "orders" ("hotelId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_orders_roomTypeId" ON "orders" ("roomTypeId")`,
    );

    // ========== room_inventories ==========
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "room_inventories" (
        "id" SERIAL PRIMARY KEY,
        "roomTypeId" int NOT NULL,
        "date" date NOT NULL,
        "total" int NOT NULL,
        "reserved" int NOT NULL DEFAULT 0,
        "sold" int NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_room_inventories_roomTypeId_date" ON "room_inventories" ("roomTypeId", "date")`,
    );

    // ========== payment_events ==========
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_events" (
        "id" SERIAL PRIMARY KEY,
        "eventId" varchar(80) NOT NULL,
        "orderId" int NOT NULL,
        "paymentNo" varchar(80),
        "status" varchar(20) NOT NULL DEFAULT 'received',
        "rawPayload" text,
        "processedAt" bigint,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payment_events_eventId" ON "payment_events" ("eventId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payment_events_orderId" ON "payment_events" ("orderId")`,
    );

    // ========== audit_logs ==========
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" SERIAL PRIMARY KEY,
        "action" varchar(100) NOT NULL,
        "actorType" varchar(50) NOT NULL,
        "actorId" int,
        "targetType" varchar(50),
        "targetId" int,
        "payload" text,
        "createdAt" bigint NOT NULL
      )
    `);

    // ========== notifications ==========
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" SERIAL PRIMARY KEY,
        "type" varchar(50) NOT NULL,
        "hotelId" int NOT NULL,
        "hotelName" varchar(200) NOT NULL,
        "message" text NOT NULL,
        "targetUserId" int NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "timestamp" bigint NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notifications_targetUserId" ON "notifications" ("targetUserId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "room_inventories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hotel_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "room_types"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hotels"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
