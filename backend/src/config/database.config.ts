import { registerAs } from '@nestjs/config';
import path from 'path';

const resolveSqliteDatabasePath = (db: string): string => {
  if (db === ':memory:' || db.startsWith('file:')) return db;
  if (path.isAbsolute(db)) return db;
  const backendRoot = path.resolve(__dirname, '../..');
  return path.resolve(backendRoot, db);
};

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

export default registerAs('database', () => {
  const databaseUrl = process.env.DATABASE_URL;
  const dbType = databaseUrl ? 'postgres' : process.env.DB_TYPE?.toLowerCase();
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  if (dbType === 'postgres' || dbType === 'postgresql') {
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
      synchronize: !isProd,
      logging: !isProd && !isTest,
      ...(isRemote ? { ssl: { rejectUnauthorized: false } } : {}),
    };
  }

  return {
    type: 'better-sqlite3',
    database: resolveSqliteDatabasePath(process.env.DB_DATABASE || 'hotel_management.sqlite'),
    synchronize: !isProd,
    logging: !isProd && !isTest,
  };
});
