// 创建测试用户的脚本
const bcrypt = require('bcrypt');
const sqlite3 = require('better-sqlite3');

async function createTestUser() {
  try {
    // 连接数据库
    const db = sqlite3('hotel_management.sqlite');
    
    // 创建商户账号
    const merchantPassword = await bcrypt.hash('merchant123', 10);
    const merchantResult = db.prepare(`
      INSERT INTO users (username, password, role, nickname, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run('merchant', merchantPassword, 'merchant', '测试商户');
    
    console.log('✅ 商户账号创建成功！');
    console.log('   用户名: merchant');
    console.log('   密码: merchant123');
    console.log('   角色: 商户');
    
    // 创建管理员账号
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminResult = db.prepare(`
      INSERT INTO users (username, password, role, nickname, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run('admin', adminPassword, 'admin', '测试管理员');
    
    console.log('\n✅ 管理员账号创建成功！');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('   角色: 管理员');
    
    // 查询验证
    const users = db.prepare('SELECT id, username, role, nickname FROM users').all();
    console.log('\n📊 数据库中的用户：');
    console.table(users);
    
    db.close();
    console.log('\n🎉 测试账号创建完成！现在可以登录了。');
    
  } catch (error) {
    console.error('❌ 创建失败：', error.message);
  }
}

createTestUser();
