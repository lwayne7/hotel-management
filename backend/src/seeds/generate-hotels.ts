/**
 * 生成1000家测试酒店的种子数据
 * 
 * 特点：
 * 1. 每家酒店使用唯一的 Unsplash 图片 (sig参数确保唯一)
 * 2. 随机分配不同的设施标签用于筛选测试
 * 3. 覆盖多个城市、星级和价位区间
 */

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Hotel, HotelStatus } from '../hotels/entities/hotel.entity';
import { RoomType } from '../hotels/entities/room-type.entity';
import { HotelImage } from '../hotels/entities/hotel-image.entity';
import { User } from '../users/entities/user.entity';

// 城市列表
const CITIES = [
    '上海', '北京', '广州', '深圳', '杭州', '成都', '重庆', '西安', '苏州', '南京',
    '武汉', '长沙', '青岛', '厦门', '大连', '天津', '三亚', '昆明', '丽江', '桂林',
    '哈尔滨', '沈阳', '济南', '郑州', '合肥', '福州', '南昌', '贵阳', '南宁', '无锡'
];

// 酒店名称前缀
const HOTEL_PREFIXES = [
    '瑞吉', '丽思卡尔顿', '柏悦', '华尔道夫', '文华东方', '安缦', '悦榕庄', '璞丽',
    '香格里拉', '万豪', '希尔顿', '凯悦', '洲际', '四季', '威斯汀', '喜来登',
    '君悦', '艾美', '瑰丽', '半岛', '凯宾斯基', '索菲特', '康莱德', '华邑',
    '皇冠假日', '假日', '智选假日', '汉庭', '如家', '全季', '亚朵', '桔子'
];

// 酒店特色后缀
const HOTEL_SUFFIXES = ['大酒店', '酒店', '度假村', '精品酒店', '商务酒店', '公寓酒店', '民宿'];

// 设施标签（确保包含筛选需要的关键词）
const FACILITY_GROUPS = {
    parent: ['亲子', '儿童乐园', '儿童泳池', '儿童俱乐部', '家庭房'],
    luxury: ['豪华', '管家服务', '米其林餐厅', '私人泳池', 'VIP服务'],
    parking: ['免费停车场', '代客泊车', '地下停车场', '充电桩'],
    breakfast: ['含早餐', '自助早餐', '中西式早餐', '房内早餐'],
    gym: ['健身房', '24小时健身', '私教服务', '瑜伽室', '跑步机'],
    pool: ['游泳池', '室内泳池', '室外泳池', '无边泳池', '恒温泳池'],
    spa: ['SPA', '按摩', '美容护理', '桑拿'],
    wifi: ['免费WiFi', '高速网络', '商务中心'],
    restaurant: ['中餐厅', '西餐厅', '自助餐厅', '酒吧', '咖啡厅'],
    meeting: ['会议室', '宴会厅', '多功能厅']
};

// 房型配置
const ROOM_TYPES = [
    { name: '标准间', priceBase: 200, sizeMin: 25, sizeMax: 30 },
    { name: '大床房', priceBase: 280, sizeMin: 28, sizeMax: 35 },
    { name: '双床房', priceBase: 280, sizeMin: 28, sizeMax: 35 },
    { name: '豪华大床房', priceBase: 400, sizeMin: 35, sizeMax: 45 },
    { name: '商务套房', priceBase: 600, sizeMin: 50, sizeMax: 70 },
    { name: '行政套房', priceBase: 800, sizeMin: 60, sizeMax: 85 },
    { name: '总统套房', priceBase: 2000, sizeMin: 100, sizeMax: 200 },
    { name: '家庭房', priceBase: 500, sizeMin: 45, sizeMax: 60 },
    { name: '亲子主题房', priceBase: 600, sizeMin: 40, sizeMax: 55 },
];

// 床型配置
const BED_TYPES = ['1.5m大床', '1.8m大床', '2m大床', '2.2m大床', '1.2m双床', '1.5m双床'];

// 区域街道
const STREET_NAMES = [
    '中山路', '人民路', '解放路', '建设路', '和平路', '长江路', '黄河路',
    '南京路', '淮海路', '延安路', '复兴路', '世纪大道', '金融街', '商业街',
    '文化路', '科技路', '创新路', '繁华路', '滨江路', '湖滨路'
];

// Unsplash 风格关键词
const UNSPLASH_KEYWORDS = [
    'hotel-room', 'luxury-hotel', 'hotel-lobby', 'resort', 'hotel-pool',
    'hotel-bedroom', 'hotel-interior', 'suite', 'hotel-view', 'hotel-bathroom'
];

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(arr: T[]): T {
    return arr[randomInt(0, arr.length - 1)];
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
    const count = randomInt(min, max);
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, arr.length));
}

function generateHotelName(index: number): string {
    const city = CITIES[index % CITIES.length];
    const prefix = HOTEL_PREFIXES[index % HOTEL_PREFIXES.length];
    const suffix = HOTEL_SUFFIXES[Math.floor(index / (CITIES.length * HOTEL_PREFIXES.length)) % HOTEL_SUFFIXES.length];
    return `${city}${prefix}${suffix}`;
}

function generateFacilities(index: number): string[] {
    const facilities: string[] = ['免费WiFi'];

    // 根据 index 决定主要标签（确保每个标签有足够的酒店）
    const tagIndex = index % 5;

    switch (tagIndex) {
        case 0: // 亲子酒店
            facilities.push(...randomSubset(FACILITY_GROUPS.parent, 2, 3));
            break;
        case 1: // 豪华酒店
            facilities.push(...randomSubset(FACILITY_GROUPS.luxury, 2, 3));
            break;
        case 2: // 停车场酒店
            facilities.push(...randomSubset(FACILITY_GROUPS.parking, 1, 2));
            break;
        case 3: // 含早餐
            facilities.push(...randomSubset(FACILITY_GROUPS.breakfast, 1, 2));
            break;
        case 4: // 健身房
            facilities.push(...randomSubset(FACILITY_GROUPS.gym, 2, 3));
            break;
    }

    // 随机添加其他设施
    if (Math.random() > 0.5) facilities.push(...randomSubset(FACILITY_GROUPS.pool, 1, 1));
    if (Math.random() > 0.5) facilities.push(...randomSubset(FACILITY_GROUPS.spa, 1, 2));
    if (Math.random() > 0.5) facilities.push(...randomSubset(FACILITY_GROUPS.restaurant, 1, 2));
    if (Math.random() > 0.3) facilities.push(...randomSubset(FACILITY_GROUPS.meeting, 1, 1));

    return [...new Set(facilities)]; // 去重
}

function generateUniqueImageUrl(hotelId: number, imageIndex: number): string {
    // 使用 Unsplash Source API 的 sig 参数确保唯一图片
    const keyword = UNSPLASH_KEYWORDS[(hotelId + imageIndex) % UNSPLASH_KEYWORDS.length];
    // 使用 Lorem Picsum 作为替代（更可靠，支持 seed）
    // 每张图片使用唯一的 seed = hotelId * 10 + imageIndex
    const seed = hotelId * 10 + imageIndex;
    return `https://picsum.photos/seed/${seed}/800/600`;
}

function generateHotel(index: number, merchantId: number): any {
    const city = CITIES[index % CITIES.length];
    const starRating = (index % 5) + 1; // 1-5 星
    const priceMultiplier = starRating * 0.5 + 0.5; // 星级越高价格越高

    const facilities = generateFacilities(index);

    // 生成房型（2-4种）
    const roomTypeCount = randomInt(2, 4);
    const selectedRoomTypes = randomSubset(ROOM_TYPES, roomTypeCount, roomTypeCount);
    const roomTypes = selectedRoomTypes.map((rt, rtIndex) => {
        const basePrice = Math.round(rt.priceBase * priceMultiplier);
        const variation = randomInt(-50, 100);
        const price = basePrice + variation;
        const originalPrice = Math.round(price * (1 + Math.random() * 0.3));

        return {
            name: rt.name,
            price,
            originalPrice,
            maxGuests: rt.name.includes('家庭') || rt.name.includes('亲子') ? 4 : 2,
            bedType: randomFrom(BED_TYPES),
            roomSize: randomInt(rt.sizeMin, rt.sizeMax),
        };
    });

    // 生成图片（2-4张，每张唯一）
    const imageCount = randomInt(2, 4);
    const images = Array.from({ length: imageCount }, (_, i) => ({
        imageUrl: generateUniqueImageUrl(index + 100, i), // +100 避免与现有数据冲突
        description: ['酒店外观', '客房', '大堂', '泳池', '餐厅'][i % 5],
    }));

    return {
        nameCn: generateHotelName(index),
        nameEn: `Hotel ${index + 1}`,
        address: `${city}市${randomFrom(STREET_NAMES)}${randomInt(1, 999)}号`,
        starRating,
        openingDate: `${2010 + randomInt(0, 14)}-${String(randomInt(1, 12)).padStart(2, '0')}-01`,
        description: `位于${city}核心地段的优质酒店，设施完善，服务周到。${facilities.slice(0, 3).join('、')}等设施一应俱全。`,
        facilities,
        nearbyAttractions: [`${city}地标`, '商业中心', '地铁站'],
        transportation: [`地铁${randomInt(1, 10)}号线`, '公交便利'],
        status: HotelStatus.APPROVED,
        merchantId,
        roomTypes,
        images,
    };
}

async function generateMassHotels() {
    console.log('🚀 开始生成1000家测试酒店...\n');

    // 加载环境变量
    const { config } = await import('dotenv');
    config({ path: '.env.local' });
    config({ path: '.env' });

    // 根据 .env 配置决定数据库类型
    const dbType = process.env.DB_TYPE || 'sqlite';
    console.log(`📂 数据库类型: ${dbType}`);

    let dataSourceOptions: any;

    if (dbType === 'postgres') {
        dataSourceOptions = {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_DATABASE || 'hotel_management',
            entities: [User, Hotel, RoomType, HotelImage],
            synchronize: false,
            logging: false,
        };
        console.log(`� PostgreSQL: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
    } else {
        const path = await import('path');
        const dbPath = path.resolve(__dirname, '../..', process.env.DB_DATABASE || 'hotel_management.sqlite');
        dataSourceOptions = {
            type: 'better-sqlite3',
            database: dbPath,
            entities: [User, Hotel, RoomType, HotelImage],
            synchronize: false,
            logging: false,
        };
        console.log(`📍 SQLite: ${dbPath}`);
    }

    const AppDataSource = new DataSource(dataSourceOptions);

    await AppDataSource.initialize();
    console.log('✅ 数据库连接成功\n');

    const userRepository = AppDataSource.getRepository(User);
    const hotelRepository = AppDataSource.getRepository(Hotel);
    const roomTypeRepository = AppDataSource.getRepository(RoomType);
    const imageRepository = AppDataSource.getRepository(HotelImage);

    // 查找商户账号（按角色查找，兼容不同用户名）
    const merchant = await userRepository.findOne({ where: { role: 'merchant' as any } });
    if (!merchant) {
        console.error('❌ 未找到商户账号，请先运行 npm run seed');
        await AppDataSource.destroy();
        return;
    }
    console.log(`👤 使用商户账号: ${merchant.username} (ID: ${merchant.id})`);

    const BATCH_SIZE = 50;
    const TOTAL_HOTELS = 1000;
    let createdCount = 0;

    for (let batch = 0; batch < Math.ceil(TOTAL_HOTELS / BATCH_SIZE); batch++) {
        const hotels: any[] = [];
        const batchStart = batch * BATCH_SIZE;
        const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_HOTELS);

        for (let i = batchStart; i < batchEnd; i++) {
            hotels.push(generateHotel(i, merchant.id));
        }

        // 批量创建酒店
        for (const hotelData of hotels) {
            const { roomTypes, images, ...hotelInfo } = hotelData;

            // 使用 insert 然后获取 ID
            const result = await hotelRepository.insert(hotelInfo);
            const hotelId = result.identifiers[0].id;

            // 创建房型
            for (const rt of roomTypes) {
                await roomTypeRepository.insert({
                    ...rt,
                    hotelId,
                });
            }

            // 创建图片
            for (let imgIndex = 0; imgIndex < images.length; imgIndex++) {
                const img = images[imgIndex];
                await imageRepository.insert({
                    ...img,
                    sortOrder: imgIndex,
                    hotelId,
                });
            }

            createdCount++;
        }

        console.log(`📦 批次 ${batch + 1}/${Math.ceil(TOTAL_HOTELS / BATCH_SIZE)} 完成 (${createdCount}/${TOTAL_HOTELS})`);
    }

    console.log('\n🎉 生成完成！\n');
    console.log('📊 数据统计:');
    console.log(`   - 酒店总数: ${createdCount}`);
    console.log(`   - 覆盖城市: ${CITIES.length}个`);
    console.log(`   - 星级分布: 1-5星均匀分配`);
    console.log(`   - 标签分布: 亲子/豪华/停车场/早餐/健身房各约200家`);
    console.log(`   - 图片: 每家酒店2-4张唯一图片\n`);

    await AppDataSource.destroy();
}

generateMassHotels().catch(console.error);
