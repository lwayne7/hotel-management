/**
 * 清空酒店数据
 * 用于重新生成测试数据
 */
import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';
import { createDataSource, logDatabaseInfo } from '../config/database';

// 加载环境变量
const backendRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.resolve(backendRoot, '.env.local') });
dotenv.config({ path: path.resolve(backendRoot, '.env') });

async function clearHotels() {
  console.log('\n🗑️  开始清空酒店数据...\n');
  logDatabaseInfo();

  const dataSource = await createDataSource();
  console.log('✅ 数据库连接成功\n');

  try {
    // 使用原生SQL删除,避免外键约束问题
    console.log('⏳ 正在删除酒店图片...');
    const imageResult = await dataSource.query('DELETE FROM hotel_images');
    console.log(`✓ 已删除酒店图片`);

    console.log('⏳ 正在删除房型数据...');
    const roomResult = await dataSource.query('DELETE FROM room_types');
    console.log(`✓ 已删除房型数据`);

    console.log('⏳ 正在删除酒店数据...');
    const hotelResult = await dataSource.query('DELETE FROM hotels');
    console.log(`✓ 已删除酒店数据`);

    console.log('\n🎉 酒店数据清空完成！\n');
  } catch (error) {
    console.error('❌ 清空数据失败:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

clearHotels().catch(console.error);
