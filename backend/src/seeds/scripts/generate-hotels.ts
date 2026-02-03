/**
 * 批量生成测试酒店
 * 生成 10000+ 家酒店用于筛选功能测试
 * 
 * 使用: npx ts-node src/seeds/scripts/generate-hotels.ts
 * 
 * 数据分布策略:
 * - 5个筛选标签均匀分布（各20%）
 * - 5个星级均匀分布（各20%）
 * - 30个城市均匀分布
 * - 价格区间合理分布
 */
import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';
import {
    createDataSource,
    logDatabaseInfo,
    Hotel,
    HotelStatus,
    RoomType,
    HotelImage,
    User
} from '../config/database';
import { generateHotels, printGenerationStats } from '../generators/hotel-generator';

// 加载环境变量
const backendRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.resolve(backendRoot, '.env.local') });
dotenv.config({ path: path.resolve(backendRoot, '.env') });

// 生成 10000 家酒店，确保数据量足够大
const TOTAL_HOTELS = 10000;
const BATCH_SIZE = 100; // 增大批次大小提高效率

async function generateMassHotels() {
    console.log(`🚀 开始生成 ${TOTAL_HOTELS} 家测试酒店...\n`);
    logDatabaseInfo();

    const dataSource = await createDataSource();
    console.log('✅ 数据库连接成功\n');

    const userRepository = dataSource.getRepository(User);
    const hotelRepository = dataSource.getRepository(Hotel);
    const roomTypeRepository = dataSource.getRepository(RoomType);
    const imageRepository = dataSource.getRepository(HotelImage);

    // 查找商户账号
    const merchant = await userRepository.findOne({
        where: { role: 'merchant' as any }
    });

    if (!merchant) {
        console.error('❌ 未找到商户账号，请先运行 npm run seed');
        await dataSource.destroy();
        return;
    }
    console.log(`👤 使用商户账号: ${merchant.username} (ID: ${merchant.id})\n`);

    // 生成酒店数据
    const allHotels = generateHotels({ count: TOTAL_HOTELS });

    // 批量插入
    let createdCount = 0;
    const totalBatches = Math.ceil(TOTAL_HOTELS / BATCH_SIZE);

    for (let batch = 0; batch < totalBatches; batch++) {
        const start = batch * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, TOTAL_HOTELS);
        const batchHotels = allHotels.slice(start, end);

        for (const hotelData of batchHotels) {
            const { roomTypes, images, status, ...hotelInfo } = hotelData;

            // 插入酒店
            const result = await hotelRepository.insert({
                ...hotelInfo,
                status: HotelStatus.APPROVED,
                merchantId: merchant.id,
            });
            const hotelId = result.identifiers[0].id;

            // 插入房型
            for (const rt of roomTypes) {
                await roomTypeRepository.insert({
                    ...rt,
                    hotelId,
                });
            }

            // 插入图片
            for (let i = 0; i < images.length; i++) {
                await imageRepository.insert({
                    ...images[i],
                    sortOrder: i,
                    hotelId,
                });
            }

            createdCount++;
        }

        console.log(`📦 批次 ${batch + 1}/${totalBatches} 完成 (${createdCount}/${TOTAL_HOTELS})`);
    }

    // 打印统计
    printGenerationStats(allHotels);

    console.log('\n🎉 生成完成！');
    await dataSource.destroy();
}

generateMassHotels().catch(console.error);
