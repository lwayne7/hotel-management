// 在 PostgreSQL 中创建测试用户
const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function createTestUsers() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123456',
    database: 'hotel_management',
  });

  try {
    await client.connect();
    console.log('✅ 连接到数据库成功');

    // 创建商户账号
    const merchantPassword = await bcrypt.hash('merchant123', 10);
    await client.query(`
      INSERT INTO users (username, password, role, nickname, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (username) DO NOTHING
    `, ['merchant', merchantPassword, 'merchant', '测试商户']);
    
    console.log('\n✅ 商户账号创建成功！');
    console.log('   用户名: merchant');
    console.log('   密码: merchant123');
    console.log('   角色: 商户');

    // 创建管理员账号
    const adminPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (username, password, role, nickname, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (username) DO NOTHING
    `, ['admin', adminPassword, 'admin', '测试管理员']);
    
    console.log('\n✅ 管理员账号创建成功！');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('   角色: 管理员');

    // 查询验证
    const result = await client.query('SELECT id, username, role, nickname FROM users');
    console.log('\n📊 数据库中的用户：');
    console.table(result.rows);

    await client.end();
    console.log('\n🎉 测试账号创建完成！现在可以登录了。');
    
  } catch (error) {
    console.error('❌ 错误：', error.message);
  }
}

createTestUsers();
