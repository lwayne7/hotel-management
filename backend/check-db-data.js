// 查询数据库中的数据
const { Client } = require('pg');

async function checkData() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123456',
    database: 'hotel_management',
  });

  try {
    await client.connect();
    console.log('✅ 连接到数据库成功\n');

    // 查询所有表
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 数据库中的表：');
    console.table(tablesResult.rows);

    // 查询用户数据
    console.log('\n👥 用户表 (users)：');
    const usersResult = await client.query('SELECT id, username, role, nickname FROM users');
    if (usersResult.rows.length > 0) {
      console.table(usersResult.rows);
      console.log(`总计：${usersResult.rows.length} 个用户`);
    } else {
      console.log('❌ 没有数据');
    }

    // 查询酒店数据
    console.log('\n🏨 酒店表 (hotels)：');
    const hotelsResult = await client.query(`
      SELECT id, "nameCn", address, "starRating", status, "merchantId" 
      FROM hotels 
      LIMIT 10
    `);
    if (hotelsResult.rows.length > 0) {
      console.table(hotelsResult.rows);
      const countResult = await client.query('SELECT COUNT(*) FROM hotels');
      console.log(`总计：${countResult.rows[0].count} 个酒店`);
    } else {
      console.log('❌ 没有数据');
    }

    // 查询房型数据
    console.log('\n🛏️  房型表 (room_types)：');
    const roomTypesResult = await client.query(`
      SELECT id, name, price, "hotelId" 
      FROM room_types 
      LIMIT 10
    `);
    if (roomTypesResult.rows.length > 0) {
      console.table(roomTypesResult.rows);
      const countResult = await client.query('SELECT COUNT(*) FROM room_types');
      console.log(`总计：${countResult.rows[0].count} 个房型`);
    } else {
      console.log('❌ 没有数据');
    }

    // 查询图片数据
    console.log('\n🖼️  图片表 (hotel_images)：');
    const imagesResult = await client.query(`
      SELECT id, "imageUrl", "hotelId" 
      FROM hotel_images 
      LIMIT 10
    `);
    if (imagesResult.rows.length > 0) {
      console.table(imagesResult.rows);
      const countResult = await client.query('SELECT COUNT(*) FROM hotel_images');
      console.log(`总计：${countResult.rows[0].count} 张图片`);
    } else {
      console.log('❌ 没有数据');
    }

    await client.end();
    console.log('\n✅ 查询完成');
    
  } catch (error) {
    console.error('❌ 错误：', error.message);
  }
}

checkData();
