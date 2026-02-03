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
  // 调试日志
  console.log('🔧 DB Config:', {
    DB_TYPE: process.env.DB_TYPE,
    DB_HOST: process.env.DB_HOST,
    DB_DATABASE: process.env.DB_DATABASE,
  });

  // 明确判断数据库类型
  const dbType = process.env.DB_TYPE?.toLowerCase();

  // 如果明确指定 postgres，使用 PostgreSQL
  if (dbType === 'postgres' || dbType === 'postgresql') {
    console.log('📍 Using PostgreSQL');
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
  }

  // 否则使用 SQLite
  console.log('📍 Using SQLite');
  return {
    type: 'better-sqlite3',
    database: resolveSqliteDatabasePath(process.env.DB_DATABASE || 'hotel_management.sqlite'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
  };
});
