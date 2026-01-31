import { registerAs } from '@nestjs/config';

// 判断是否使用 SQLite（开发环境默认使用）
const useSqlite = process.env.DB_TYPE === 'sqlite' || !process.env.DB_HOST;

export default registerAs('database', () => {
  if (useSqlite) {
    return {
      type: 'better-sqlite3',
      database: process.env.DB_DATABASE || 'hotel_management.sqlite',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
    };
  }
  
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'hotel_management',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
  };
});
