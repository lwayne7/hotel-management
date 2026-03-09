/**
 * 共享数据库连接配置
 * 用于种子脚本和数据生成器
 */
import 'dotenv/config';
import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Hotel, HotelStatus } from '../../hotels/entities/hotel.entity';
import { RoomType } from '../../hotels/entities/room-type.entity';
import { HotelImage } from '../../hotels/entities/hotel-image.entity';
import { User } from '../../users/entities/user.entity';
import { RoomInventory } from '../../inventory/room-inventory.entity';
import { Order } from '../../orders/order.entity';
import { PaymentEvent } from '../../payments/payment-event.entity';

// 导出实体供外部使用
export { Hotel, HotelStatus, RoomType, HotelImage, User, RoomInventory, Order, PaymentEvent };

const backendRoot = path.resolve(__dirname, '../../..');

/**
 * 解析 DATABASE_URL 环境变量
 */
function parseDatabaseUrl(url: string) {
    const parsed = new URL(url);
    return {
        host: parsed.hostname,
        port: parseInt(parsed.port || '5432', 10),
        username: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.replace(/^\//, ''),
    };
}

/**
 * 获取数据库连接配置
 */
export function getDatabaseConfig(): DataSourceOptions {
    const databaseUrl = process.env.DATABASE_URL;
    const dbType = databaseUrl ? 'postgres' : (process.env.DB_TYPE || 'sqlite');
    const isProd = process.env.NODE_ENV === 'production';

    if (dbType === 'postgres') {
        const conn = databaseUrl
            ? parseDatabaseUrl(databaseUrl)
            : {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_DATABASE || 'hotel_management',
            };
        const isRemote = conn.host !== 'localhost' && conn.host !== '127.0.0.1';
        return {
            type: 'postgres',
            ...conn,
            entities: [User, Hotel, RoomType, HotelImage, RoomInventory, Order, PaymentEvent],
            synchronize: !isProd,
            logging: false,
            ...(isRemote ? { ssl: { rejectUnauthorized: false } } : {}),
        } as DataSourceOptions;
    }

    const dbPath = path.resolve(backendRoot, process.env.DB_DATABASE || 'hotel_management.sqlite');
    return {
        type: 'better-sqlite3',
        database: dbPath,
        entities: [User, Hotel, RoomType, HotelImage, RoomInventory, Order, PaymentEvent],
        synchronize: !isProd,
        logging: false,
    } as DataSourceOptions;
}

/**
 * 创建并初始化数据源
 */
export async function createDataSource(): Promise<DataSource> {
    const config = getDatabaseConfig();
    const dataSource = new DataSource(config);
    await dataSource.initialize();
    return dataSource;
}

/**
 * 打印数据库连接信息
 */
export function logDatabaseInfo(): void {
    const databaseUrl = process.env.DATABASE_URL;
    const dbType = databaseUrl ? 'postgres' : (process.env.DB_TYPE || 'sqlite');
    console.log(`📂 数据库类型: ${dbType}`);

    if (dbType === 'postgres') {
        if (databaseUrl) {
            const conn = parseDatabaseUrl(databaseUrl);
            console.log(`📍 PostgreSQL: ${conn.host}:${conn.port}/${conn.database}`);
        } else {
            console.log(`📍 PostgreSQL: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
        }
    } else {
        console.log(`📍 SQLite: ${process.env.DB_DATABASE || 'hotel_management.sqlite'}`);
    }
}
