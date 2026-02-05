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
    Hotel,
    RoomType,
    HotelImage
} from '../config/database';
import {
    getExteriorImage,
    getLobbyImage,
    getPoolImage,
    getRoomImageByType,
    generateHotelImages,
} from '../images/hotel-images';
import { ALL_CITIES } from '../config/constants';

// 加载环境变量
const backendRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.resolve(backendRoot, '.env.local') });
dotenv.config({ path: path.resolve(backendRoot, '.env') });

function getCityIndexFromName(nameCn: string): number {
    for (let i = 0; i < ALL_CITIES.length; i++) {
        if (nameCn.startsWith(ALL_CITIES[i])) return i;
    }
    return 0;
}

async function updateImages() {
    console.log('🔄 开始更新酒店图片...\n');
    logDatabaseInfo();

    const dataSource = await createDataSource();
    console.log('✅ 数据库连接成功\n');

    const imageRepository = dataSource.getRepository(HotelImage);
    const roomTypeRepository = dataSource.getRepository(RoomType);
    const hotelRepository = dataSource.getRepository(Hotel);

    // 更新酒店图片：按 hotelId + cityIndex 生成唯一主图
    const hotelImages = await imageRepository.find({
        order: { hotelId: 'ASC', sortOrder: 'ASC' }
    });
    console.log(`📷 找到 ${hotelImages.length} 张酒店图片需要更新`);

    const imagesByHotel = new Map<number, typeof hotelImages>();
    for (const img of hotelImages) {
        if (!imagesByHotel.has(img.hotelId)) {
            imagesByHotel.set(img.hotelId, []);
        }
        imagesByHotel.get(img.hotelId)!.push(img);
    }

    let updatedCount = 0;
    for (const [hotelId, imgs] of imagesByHotel) {
        const hotel = await hotelRepository.findOne({ where: { id: hotelId } });
        const cityIndex = hotel ? getCityIndexFromName(hotel.nameCn) : 0;

        for (const img of imgs) {
            let newUrl: string;
            if (img.sortOrder === 0) {
                newUrl = getExteriorImage(hotelId, cityIndex, 0);
            } else if (img.sortOrder === 1) {
                newUrl = getLobbyImage(hotelId, cityIndex);
            } else if (img.sortOrder === 2) {
                newUrl = getPoolImage(hotelId, cityIndex);
            } else {
                newUrl = getExteriorImage(hotelId, cityIndex, 400);
            }
            await imageRepository.update(img.id, { imageUrl: newUrl });
            updatedCount++;
        }
    }
    console.log(`   ✓ 更新了 ${updatedCount} 张酒店图片`);

    // 更新房型图片：使用 hotelId + roomIndex + cityIndex 确保唯一
    const roomTypes = await roomTypeRepository.find({
        order: { hotelId: 'ASC', id: 'ASC' }
    });
    console.log(`🛏️ 找到 ${roomTypes.length} 个房型需要更新图片`);

    const stats = { 大床房: 0, 双床房: 0, 套房: 0, 家庭房: 0, 标准间: 0 };
    let roomUpdatedCount = 0;
    let lastHotelId = 0;
    let roomIndex = 0;

    for (const rt of roomTypes) {
        if (rt.hotelId !== lastHotelId) {
            lastHotelId = rt.hotelId;
            roomIndex = 0;
        }
        const hotel = await hotelRepository.findOne({ where: { id: rt.hotelId } });
        const cityIndex = hotel ? getCityIndexFromName(hotel.nameCn) : 0;
        const newUrl = getRoomImageByType(rt.name, rt.hotelId, roomIndex, cityIndex);
        await roomTypeRepository.update(rt.id, { imageUrl: newUrl });
        roomUpdatedCount++;
        roomIndex++;

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

    // 为无图酒店补唯一主图（按 hotelId + cityIndex 生成，保证每家图不同）
    const allHotels = await hotelRepository.find({ select: ['id', 'nameCn'] });
    let fixedNoImage = 0;
    for (const hotel of allHotels) {
        const imgs = await imageRepository.find({
            where: { hotelId: hotel.id },
            order: { sortOrder: 'ASC' },
        });
        const hasValidImage = imgs.some((img) => img?.imageUrl?.trim?.());
        if (!hasValidImage) {
            const cityIndex = getCityIndexFromName(hotel.nameCn);
            const generated = generateHotelImages(hotel.id, cityIndex, 1);
            if (generated.length > 0) {
                if (imgs.length > 0) {
                    await imageRepository.update(imgs[0].id, {
                        imageUrl: generated[0].imageUrl,
                        description: generated[0].description || '酒店外观',
                    });
                } else {
                    await imageRepository.insert({
                        hotelId: hotel.id,
                        imageUrl: generated[0].imageUrl,
                        description: generated[0].description || '酒店外观',
                        sortOrder: 0,
                    });
                }
                fixedNoImage++;
            }
        }
    }
    if (fixedNoImage > 0) {
        console.log(`\n🖼️  为 ${fixedNoImage} 家无图酒店补唯一主图`);
    }

    console.log('\n🎉 图片更新完成！');
    await dataSource.destroy();
}

updateImages().catch(console.error);
