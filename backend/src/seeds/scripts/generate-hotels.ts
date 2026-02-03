/**
 * 批量生成测试酒店
 * 生成 10000 家酒店用于筛选功能测试
 * 
 * 使用: npx ts-node src/seeds/scripts/generate-hotels.ts
 * 
 * 数据分布策略:
 * - 5个筛选标签均匀分布（各20%）
 * - 5个星级均匀分布（各20%）
 * - 50个城市均匀分布
 * - 价格区间合理分布
 * 
 * 性能优化:
 * - 使用事务批量提交
 * - 批量生成数据后统一插入
 * - 进度显示和耗时统计
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
import { DataSource } from 'typeorm';

// 加载环境变量
const backendRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.resolve(backendRoot, '.env.local') });
dotenv.config({ path: path.resolve(backendRoot, '.env') });

// 生成 10000 家酒店，确保数据量足够大
const TOTAL_HOTELS = 10000;
const BATCH_SIZE = 500; // 增大批次大小提高效率
const TRANSACTION_SIZE = 100; // 每个事务处理的酒店数量

/**
 * 格式化时间为可读字符串
 */
function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds % 60}s`;
}

/**
 * 显示进度条
 */
function showProgress(current: number, total: number, startTime: number): void {
    const percent = Math.floor((current / total) * 100);
    const elapsed = Date.now() - startTime;
    const eta = current > 0 ? Math.floor((elapsed / current) * (total - current)) : 0;
    const barLength = 30;
    const filled = Math.floor((current / total) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    
    process.stdout.write(`\r📊 进度: [${bar}] ${percent}% (${current}/${total}) | 耗时: ${formatDuration(elapsed)} | 预计剩余: ${formatDuration(eta)}`);
}

/**
 * 使用事务批量插入酒店数据
 */
async function insertHotelsBatch(
    dataSource: DataSource,
    hotels: ReturnType<typeof generateHotels>,
    merchantId: number,
    startIndex: number
): Promise<void> {
    const hotelRepository = dataSource.getRepository(Hotel);
    const roomTypeRepository = dataSource.getRepository(RoomType);
    const imageRepository = dataSource.getRepository(HotelImage);

    // 使用事务确保数据一致性
    await dataSource.transaction(async (manager) => {
        for (const hotelData of hotels) {
            const { roomTypes, images, status, ...hotelInfo } = hotelData;

            // 插入酒店
            const result = await manager.insert(Hotel, {
                ...hotelInfo,
                status: HotelStatus.APPROVED,
                merchantId,
            });
            const hotelId = result.identifiers[0].id;

            // 批量插入房型
            if (roomTypes.length > 0) {
                await manager.insert(
                    RoomType,
                    roomTypes.map((rt) => ({
                        ...rt,
                        hotelId,
                    }))
                );
            }

            // 批量插入图片
            if (images.length > 0) {
                await manager.insert(
                    HotelImage,
                    images.map((img, i) => ({
                        ...img,
                        sortOrder: i,
                        hotelId,
                    }))
                );
            }
        }
    });
}

async function generateMassHotels() {
    const startTime = Date.now();
    console.log(`\n🚀 开始生成 ${TOTAL_HOTELS.toLocaleString()} 家测试酒店...\n`);
    logDatabaseInfo();

    const dataSource = await createDataSource();
    console.log('✅ 数据库连接成功\n');

    const userRepository = dataSource.getRepository(User);
    const hotelRepository = dataSource.getRepository(Hotel);

    // 检查现有酒店数量
    const existingCount = await hotelRepository.count();
    if (existingCount >= TOTAL_HOTELS) {
        console.log(`⚠️  数据库已有 ${existingCount.toLocaleString()} 家酒店，无需重新生成`);
        console.log('   如需重新生成，请先清空酒店数据');
        await dataSource.destroy();
        return;
    }

    // 查找商户账号
    const merchant = await userRepository.findOne({
        where: { role: 'merchant' as any }
    });

    if (!merchant) {
        console.error('❌ 未找到商户账号，请先运行 npm run seed');
        await dataSource.destroy();
        return;
    }
    console.log(`👤 使用商户账号: ${merchant.username} (ID: ${merchant.id})`);
    console.log(`📦 批次大小: ${TRANSACTION_SIZE} 家/事务\n`);

    // 计算需要生成的数量（扣除已有的精选酒店）
    const toGenerate = TOTAL_HOTELS - existingCount;
    console.log(`📝 生成 ${toGenerate.toLocaleString()} 家酒店 (已有 ${existingCount} 家)\n`);

    // 生成酒店数据
    console.log('⏳ 正在生成酒店数据...');
    const genStart = Date.now();
    const allHotels = generateHotels({ count: toGenerate, startIndex: existingCount });
    console.log(`✓ 数据生成完成，耗时 ${formatDuration(Date.now() - genStart)}\n`);

    // 批量插入
    let createdCount = 0;
    const totalBatches = Math.ceil(toGenerate / TRANSACTION_SIZE);
    const insertStart = Date.now();

    console.log('⏳ 正在写入数据库...');
    for (let batch = 0; batch < totalBatches; batch++) {
        const start = batch * TRANSACTION_SIZE;
        const end = Math.min(start + TRANSACTION_SIZE, toGenerate);
        const batchHotels = allHotels.slice(start, end);

        try {
            await insertHotelsBatch(dataSource, batchHotels, merchant.id, existingCount + start);
            createdCount += batchHotels.length;
            showProgress(createdCount, toGenerate, insertStart);
        } catch (error) {
            console.error(`\n❌ 批次 ${batch + 1} 插入失败:`, error);
            throw error;
        }
    }

    console.log('\n\n✅ 数据库写入完成\n');

    // 打印统计
    printGenerationStats(allHotels);

    const totalTime = Date.now() - startTime;
    console.log(`\n🎉 生成完成！总耗时: ${formatDuration(totalTime)}`);
    console.log(`   平均速度: ${Math.floor(toGenerate / (totalTime / 1000))} 家/秒`);
    
    // 验证最终数量
    const finalCount = await hotelRepository.count();
    console.log(`   数据库酒店总数: ${finalCount.toLocaleString()} 家`);

    await dataSource.destroy();
}

generateMassHotels().catch(console.error);
