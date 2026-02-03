/**
 * 更新数据库中的酒店图片
 * 根据房型名称匹配对应的图片
 * 使用基于hotelId的伪随机来确保每个酒店有独特的图片组合
 * 
 * 使用: npx ts-node src/seeds/scripts/update-images.ts
 */
import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';
import {
    createDataSource,
    logDatabaseInfo,
    RoomType,
    HotelImage
} from '../config/database';
import {
    HOTEL_EXTERIOR_IMAGES,
    HOTEL_ROOM_IMAGES,
    HOTEL_LOBBY_IMAGES,
    HOTEL_POOL_IMAGES,
    getRoomImageByType
} from '../images/hotel-images';

// 加载环境变量
const backendRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.resolve(backendRoot, '.env.local') });
dotenv.config({ path: path.resolve(backendRoot, '.env') });

/**
 * 基于种子的伪随机数生成器
 * 确保相同的种子产生相同的随机序列（可重复性）
 */
function seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}

async function updateImages() {
    console.log('🔄 开始更新酒店图片...\n');
    logDatabaseInfo();

    const dataSource = await createDataSource();
    console.log('✅ 数据库连接成功\n');

    const imageRepository = dataSource.getRepository(HotelImage);
    const roomTypeRepository = dataSource.getRepository(RoomType);

    // 更新酒店图片
    const hotelImages = await imageRepository.find({
        order: { hotelId: 'ASC', sortOrder: 'ASC' }
    });
    console.log(`📷 找到 ${hotelImages.length} 张酒店图片需要更新`);

    // 按酒店分组处理，确保每个酒店的图片组合是独特的
    const imagesByHotel = new Map<number, typeof hotelImages>();
    for (const img of hotelImages) {
        if (!imagesByHotel.has(img.hotelId)) {
            imagesByHotel.set(img.hotelId, []);
        }
        imagesByHotel.get(img.hotelId)!.push(img);
    }

    let updatedCount = 0;
    for (const [hotelId, imgs] of imagesByHotel) {
        // 使用hotelId作为种子，生成该酒店专属的随机序列
        const rng = seededRandom(hotelId * 31 + 17);

        // 为每种类型的图片生成独特的随机索引
        const exteriorIdx = Math.floor(rng() * HOTEL_EXTERIOR_IMAGES.length);
        const roomIdx = Math.floor(rng() * HOTEL_ROOM_IMAGES.length);
        const lobbyIdx = Math.floor(rng() * HOTEL_LOBBY_IMAGES.length);
        const poolIdx = Math.floor(rng() * HOTEL_POOL_IMAGES.length);

        for (const img of imgs) {
            let newUrl: string;

            if (img.sortOrder === 0) {
                newUrl = HOTEL_EXTERIOR_IMAGES[exteriorIdx];
            } else if (img.sortOrder === 1) {
                newUrl = HOTEL_ROOM_IMAGES[roomIdx];
            } else if (img.sortOrder === 2) {
                newUrl = HOTEL_LOBBY_IMAGES[lobbyIdx];
            } else {
                newUrl = HOTEL_POOL_IMAGES[poolIdx];
            }

            await imageRepository.update(img.id, { imageUrl: newUrl });
            updatedCount++;
        }
    }
    console.log(`   ✓ 更新了 ${updatedCount} 张酒店图片`);

    // 更新房型图片 - 同样使用seeded random确保多样性
    const roomTypes = await roomTypeRepository.find({
        order: { hotelId: 'ASC', id: 'ASC' }
    });
    console.log(`🛏️ 找到 ${roomTypes.length} 个房型需要更新图片`);

    const stats = { 大床房: 0, 双床房: 0, 套房: 0, 家庭房: 0, 标准间: 0 };
    let roomUpdatedCount = 0;

    for (const rt of roomTypes) {
        // 使用hotelId + roomTypeId组合作为种子，确保每个房型有独特图片
        const rng = seededRandom(rt.hotelId * 1000 + rt.id);
        const randomOffset = Math.floor(rng() * 100);

        const newUrl = getRoomImageByType(rt.name, randomOffset);
        await roomTypeRepository.update(rt.id, { imageUrl: newUrl });
        roomUpdatedCount++;

        // 统计
        if (rt.name.includes('套房')) stats['套房']++;
        else if (rt.name.includes('双床') || rt.name.includes('标准间')) stats['双床房']++;
        else if (rt.name.includes('家庭') || rt.name.includes('亲子')) stats['家庭房']++;
        else if (rt.name.includes('大床') || rt.name.includes('豪华')) stats['大床房']++;
        else stats['标准间']++;
    }

    console.log(`   ✓ 更新了 ${roomUpdatedCount} 个房型图片`);
    console.log('\n   📊 房型分布:');
    for (const [type, count] of Object.entries(stats)) {
        console.log(`      ${type}: ${count}`);
    }

    console.log('\n🎉 图片更新完成！');
    await dataSource.destroy();
}

updateImages().catch(console.error);
