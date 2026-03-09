/**
 * 数据库种子脚本
 * 初始化用户和精选酒店数据
 * 
 * 使用: npm run seed
 */
import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import {
    createDataSource,
    logDatabaseInfo,
    Hotel,
    HotelStatus,
    RoomType,
    HotelImage,
    User,
    RoomInventory,
} from '../config/database';
import { SEED_USERS, printUserCredentials } from '../data/users';
import { FEATURED_HOTELS } from '../data/featured-hotels';
import { getRoomImageByType, generateHotelImages } from '../images/hotel-images';
import { ALL_CITIES } from '../config/constants';

// 加载环境变量
const backendRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.resolve(backendRoot, '.env.local') });
dotenv.config({ path: path.resolve(backendRoot, '.env') });

async function seed() {
    console.log('🌱 开始初始化种子数据...\n');
    logDatabaseInfo();

    const dataSource = await createDataSource();
    console.log('✅ 数据库连接成功\n');

    const userRepository = dataSource.getRepository(User);
    const hotelRepository = dataSource.getRepository(Hotel);
    const roomTypeRepository = dataSource.getRepository(RoomType);
    const imageRepository = dataSource.getRepository(HotelImage);
    const inventoryRepository = dataSource.getRepository(RoomInventory);

    // ========== 初始化用户 ==========
    console.log('📝 初始化/补齐测试用户...');
    let createdUsers = 0;
    for (const userData of SEED_USERS) {
        const exists = await userRepository.findOne({ where: { username: userData.username } });
        if (exists) continue;
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await userRepository.save({
            ...userData,
            password: hashedPassword,
        } as any);
        createdUsers++;
    }
    if (createdUsers > 0) {
        console.log(`   ✓ 新增了 ${createdUsers} 个用户（总模板 ${SEED_USERS.length}）`);
    } else {
        console.log('   ✓ 用户已齐全，无需新增');
    }

    // ========== 初始化精选酒店 ==========
    const merchant = await userRepository.findOne({
        where: { role: 'merchant' as any }
    });

    if (!merchant) {
        console.error('❌ 未找到商户账号');
        await dataSource.destroy();
        return;
    }

    const existingHotels = await hotelRepository.count();
    if (existingHotels === 0) {
        console.log('🏨 创建精选酒店...');

        await dataSource.transaction(async (manager) => {
            // ① 批量插入所有酒店
            const hotelEntities = FEATURED_HOTELS.map((h) => {
                const { roomTypes, images, status, ...hotelInfo } = h;
                return { ...hotelInfo, status: HotelStatus.APPROVED, merchantId: merchant.id };
            });

            const hotelResult = await manager
                .createQueryBuilder()
                .insert()
                .into(Hotel)
                .values(hotelEntities)
                .execute();

            const hotelIds: number[] = hotelResult.identifiers.map((r) => r.id as number);

            // ② 批量插入所有房型
            const allRoomTypes: any[] = [];
            for (let i = 0; i < FEATURED_HOTELS.length; i++) {
                const hotelId = hotelIds[i];
                const cityIndex = ALL_CITIES.findIndex((c) => FEATURED_HOTELS[i].nameCn.startsWith(c));
                const safeCityIndex = cityIndex >= 0 ? cityIndex : 0;
                for (let j = 0; j < FEATURED_HOTELS[i].roomTypes.length; j++) {
                    const rt = FEATURED_HOTELS[i].roomTypes[j];
                    allRoomTypes.push({
                        ...rt,
                        imageUrl: rt.imageUrl || getRoomImageByType(rt.name, hotelId, j, safeCityIndex),
                        hotelId,
                    });
                }
            }
            if (allRoomTypes.length > 0) {
                await manager.createQueryBuilder().insert().into(RoomType).values(allRoomTypes).execute();
            }

            // ③ 批量插入所有图片
            const allImages: any[] = [];
            for (let i = 0; i < FEATURED_HOTELS.length; i++) {
                const hotelId = hotelIds[i];
                const cityIndex = ALL_CITIES.findIndex((c) => FEATURED_HOTELS[i].nameCn.startsWith(c));
                const safeCityIndex = cityIndex >= 0 ? cityIndex : 0;
                const imageCount = Math.min(4, Math.max(2, FEATURED_HOTELS[i].images.length));
                const imagesToSave = generateHotelImages(hotelId, safeCityIndex, imageCount);
                for (let k = 0; k < imagesToSave.length; k++) {
                    allImages.push({ ...imagesToSave[k], sortOrder: k, hotelId });
                }
            }
            if (allImages.length > 0) {
                await manager.createQueryBuilder().insert().into(HotelImage).values(allImages).execute();
            }
        });

        console.log(`   ✓ 创建了 ${FEATURED_HOTELS.length} 家精选酒店`);
    } else {
        console.log('⚠️  数据库已有酒店数据，跳过酒店初始化');
    }

    // ========== 初始化房型库存（未来 30 天） ==========
    const existingInventories = await inventoryRepository.count();
    if (existingInventories === 0) {
        console.log('\n📦 初始化房型库存（未来30天，每天 total=10）...');
        const roomTypes = await roomTypeRepository.find();
        const today = new Date();
        const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        const days = 30;

        const inventoryRows: Array<Partial<RoomInventory>> = [];
        for (const rt of roomTypes) {
            for (let i = 0; i < days; i++) {
                const d = new Date(start);
                d.setUTCDate(d.getUTCDate() + i);
                const dateStr = d.toISOString().slice(0, 10);
                inventoryRows.push({
                    roomTypeId: rt.id,
                    date: dateStr,
                    total: 10,
                    reserved: 0,
                    sold: 0,
                });
            }
        }

        const batchSize = 2000;
        for (let i = 0; i < inventoryRows.length; i += batchSize) {
            const batch = inventoryRows.slice(i, i + batchSize);
            await inventoryRepository
                .createQueryBuilder()
                .insert()
                .into(RoomInventory)
                .values(batch as any)
                .execute();
        }
        console.log(`   ✓ 初始化库存记录 ${inventoryRows.length} 条（房型数 ${roomTypes.length}）`);
    } else {
        console.log('\n⚠️  数据库已有库存数据，跳过库存初始化');
    }

    console.log('\n🎉 种子数据初始化完成！');
    printUserCredentials();

    await dataSource.destroy();
}

seed().catch(console.error);
