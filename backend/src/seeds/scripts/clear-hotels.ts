/**
 * 清空所有酒店相关数据（酒店、房型、酒店图片）
 * 不删除用户数据
 *
 * 使用: npm run clear-hotels
 */
import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';
import {
  createDataSource,
  logDatabaseInfo,
  Hotel,
  RoomType,
  HotelImage,
} from '../config/database';

const backendRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.resolve(backendRoot, '.env.local') });
dotenv.config({ path: path.resolve(backendRoot, '.env') });

async function clearHotels() {
  console.log('🗑️  开始清空酒店数据...\n');
  logDatabaseInfo();

  const dataSource = await createDataSource();
  console.log('✅ 数据库连接成功\n');

  const hotelImageRepository = dataSource.getRepository(HotelImage);
  const roomTypeRepository = dataSource.getRepository(RoomType);
  const hotelRepository = dataSource.getRepository(Hotel);

  // 按外键依赖顺序删除：先图片、再房型、再酒店（TypeORM 不允许 delete({})，用 QueryBuilder）
  const deletedImages = await hotelImageRepository
    .createQueryBuilder()
    .delete()
    .execute();
  const deletedRoomTypes = await roomTypeRepository
    .createQueryBuilder()
    .delete()
    .execute();
  const deletedHotels = await hotelRepository
    .createQueryBuilder()
    .delete()
    .execute();

  const imgCount =
    typeof deletedImages.affected === 'number' ? deletedImages.affected : 0;
  const roomCount =
    typeof deletedRoomTypes.affected === 'number'
      ? deletedRoomTypes.affected
      : 0;
  const hotelCount =
    typeof deletedHotels.affected === 'number' ? deletedHotels.affected : 0;

  console.log(`   ✓ 删除酒店图片: ${imgCount.toLocaleString()} 张`);
  console.log(`   ✓ 删除房型: ${roomCount.toLocaleString()} 个`);
  console.log(`   ✓ 删除酒店: ${hotelCount.toLocaleString()} 家`);
  console.log('\n🎉 酒店数据已清空（用户数据已保留）');

  await dataSource.destroy();
}

clearHotels().catch((err) => {
  console.error('❌ 清空失败:', err);
  process.exit(1);
});
