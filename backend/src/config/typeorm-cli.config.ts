import { DataSource } from 'typeorm';
import path from 'path';

/**
 * TypeORM CLI 专用配置文件（供 migration:generate / migration:run 使用）。
 * 仅支持 PostgreSQL，因为迁移是生产环境特性。
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'hotel_management',
  entities: [path.resolve(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [path.resolve(__dirname, '..', 'migrations', '*{.ts,.js}')],
  synchronize: false,
  logging: true,
});
