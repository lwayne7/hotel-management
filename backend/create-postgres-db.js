// 创建 PostgreSQL 数据库的脚本
const { Client } = require('pg');

async function createDatabase() {
  // 先连接到默认的 postgres 数据库
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123456',
    database: 'postgres', // 连接到默认数据库
  });

  try {
    await client.connect();
    console.log('✅ 成功连接到 PostgreSQL');

    // 检查数据库是否已存在
    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'hotel_management'"
    );

    if (checkResult.rows.length > 0) {
      console.log('ℹ️  数据库 hotel_management 已存在');
    } else {
      // 创建数据库
      await client.query('CREATE DATABASE hotel_management');
      console.log('✅ 数据库 hotel_management 创建成功！');
    }

    await client.end();
    console.log('\n🎉 完成！现在可以重启后端服务了。');
    
  } catch (error) {
    console.error('❌ 错误：', error.message);
    console.error('\n请检查：');
    console.error('1. PostgreSQL 服务是否启动？');
    console.error('2. 密码是否正确（123456）？');
    console.error('3. 端口 5432 是否正确？');
  }
}

createDatabase();
