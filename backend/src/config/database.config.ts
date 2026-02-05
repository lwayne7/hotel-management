import { registerAs } from '@nestjs/config';
import path from 'path';

const resolveSqliteDatabasePath = (db: string): string => {
  if (db === ':memory:' || db.startsWith('file:')) return db;
  if (path.isAbsolute(db)) return db;
  const backendRoot = path.resolve(__dirname, '../..');
  return path.resolve(backendRoot, db);
};

export default registerAs('database', () => {
  const dbType = process.env.DB_TYPE?.toLowerCase();
  const isProd = process.env.NODE_ENV === 'production';

  if (dbType === 'postgres' || dbType === 'postgresql') {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'hotel_management',
      synchronize: !isProd,
      logging: !isProd,
    };
  }

  return {
    type: 'better-sqlite3',
    database: resolveSqliteDatabasePath(process.env.DB_DATABASE || 'hotel_management.sqlite'),
    synchronize: !isProd,
    logging: !isProd,
  };
});
