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
    User
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

    // ========== 初始化用户 ==========
    const existingUsers = await userRepository.count();
    if (existingUsers === 0) {
        console.log('📝 创建测试用户...');
        for (const userData of SEED_USERS) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
            } as any);
        }
        console.log(`   ✓ 创建了 ${SEED_USERS.length} 个用户`);
    } else {
        console.log('⚠️  数据库已有用户数据，跳过用户初始化');
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

        for (let i = 0; i < FEATURED_HOTELS.length; i++) {
            const hotelData = FEATURED_HOTELS[i];
            const { roomTypes, images, status, ...hotelInfo } = hotelData;

            // 创建酒店
            const hotel = hotelRepository.create({
                ...hotelInfo,
                status: HotelStatus.APPROVED,
                merchantId: merchant.id,
            });
            const savedHotel = await hotelRepository.save(hotel);
            const hotelId = savedHotel.id;
            const cityIndex = ALL_CITIES.findIndex((c) => hotelData.nameCn.startsWith(c));
            const safeCityIndex = cityIndex >= 0 ? cityIndex : 0;

            // 创建房型（房型图用 hotelId 保证唯一）
            for (let j = 0; j < roomTypes.length; j++) {
                const rt = roomTypes[j];
                await roomTypeRepository.save({
                    ...rt,
                    imageUrl: rt.imageUrl || getRoomImageByType(rt.name, hotelId, j, safeCityIndex),
                    hotelId,
                });
            }

            // 使用真实 hotelId 生成酒店图片，避免不同酒店主图重复
            const imageCount = Math.min(4, Math.max(2, images.length));
            const imagesToSave = generateHotelImages(hotelId, safeCityIndex, imageCount);
            for (let k = 0; k < imagesToSave.length; k++) {
                await imageRepository.save({
                    ...imagesToSave[k],
                    sortOrder: k,
                    hotelId,
                });
            }
        }

        console.log(`   ✓ 创建了 ${FEATURED_HOTELS.length} 家精选酒店`);
    } else {
        console.log('⚠️  数据库已有酒店数据，跳过酒店初始化');
    }

    console.log('\n🎉 种子数据初始化完成！');
    printUserCredentials();

    await dataSource.destroy();
}

seed().catch(console.error);
