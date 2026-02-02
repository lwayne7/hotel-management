import { registerAs } from '@nestjs/config';
import path from 'path';

const resolveSqliteDatabasePath = (db: string): string => {
  // 支持 SQLite 特殊连接字符串
  if (db === ':memory:' || db.startsWith('file:')) return db;
  if (path.isAbsolute(db)) return db;
  // 固定到后端项目根目录，避免工作目录不同导致生成/读取到另一份空库
  const backendRoot = path.resolve(__dirname, '../..');
  return path.resolve(backendRoot, db);
};

export default registerAs('database', () => {
  // 判断是否使用 SQLite（只有明确设置 DB_TYPE=sqlite 或没有设置 DB_HOST 时才用 SQLite）
  const useSqlite = process.env.DB_TYPE === 'sqlite' || (!process.env.DB_TYPE && !process.env.DB_HOST);
  
  if (useSqlite) {
    return {
      type: 'better-sqlite3',
      database: resolveSqliteDatabasePath(process.env.DB_DATABASE || 'hotel_management.sqlite'),
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
