/**
 * 酒店生成器
 * 批量生成测试酒店数据，确保筛选标签均匀分布
 * 使用 hotelId + cityIndex 作为种子确保不同城市有不同图片
 */
import { SeedHotel, SeedRoomType } from '../config/types';
import {
    ALL_CITIES,
    FACILITY_GROUPS,
    FILTER_TAGS,
    ROOM_TYPE_CONFIGS,
    HOTEL_BRANDS,
    HOTEL_SUFFIXES,
    STREET_NAMES,
} from '../config/constants';
import {
    getRoomImageByType,
    generateHotelImages,
} from '../images/hotel-images';

// ========== 工具函数 ==========

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

// ========== 名称生成 ==========

function getHotelBrandsByStarRating(starRating: number): string[] {
    switch (starRating) {
        case 5: return [...HOTEL_BRANDS.luxury, ...HOTEL_BRANDS.upscale];
        case 4: return [...HOTEL_BRANDS.upscale, ...HOTEL_BRANDS.midUpscale];
        case 3: return [...HOTEL_BRANDS.midUpscale, ...HOTEL_BRANDS.economy];
        default: return HOTEL_BRANDS.economy;
    }
}

function generateHotelName(city: string, starRating: number, index: number): { nameCn: string; nameEn: string } {
    const brands = getHotelBrandsByStarRating(starRating);
    const brand = brands[index % brands.length];
    const suffixIndex = Math.floor(index / brands.length) % HOTEL_SUFFIXES.length;
    const suffix = HOTEL_SUFFIXES[suffixIndex];
    // 为避免重名，在名称后加上编号（当索引较大时）
    const suffix2 = index >= brands.length * HOTEL_SUFFIXES.length ? `${Math.floor(index / (brands.length * HOTEL_SUFFIXES.length)) + 1}号店` : '';

    return {
        nameCn: `${city}${brand}${suffix}${suffix2}`,
        nameEn: `${brand} Hotel ${city} ${index + 1}`,
    };
}

/**
 * 根据索引生成设施标签，确保每个主标签有足够数量
 * @param index 酒店索引
 * @param starRating 星级
 */
function generateFacilities(index: number, starRating: number): string[] {
    const facilities: string[] = ['免费WiFi', '24小时前台'];

    // 根据 index % 5 决定主标签（确保5个筛选标签均匀分布）
    const tagIndex = index % 5;
    const primaryTag = FILTER_TAGS[tagIndex];

    // 总是添加主标签（确保筛选一定能匹配到）
    facilities.push(primaryTag);

    // 根据主标签添加相关设施
    switch (primaryTag) {
        case '亲子':
            facilities.push(...randomSubset(FACILITY_GROUPS.family.tags.filter(t => t !== primaryTag), 1, 3));
            break;
        case '豪华':
            facilities.push(...randomSubset(FACILITY_GROUPS.luxury.tags.filter(t => t !== primaryTag), 1, 3));
            break;
        case '免费停车场':
            facilities.push(...randomSubset(FACILITY_GROUPS.parking.tags.filter(t => t !== primaryTag), 0, 2));
            break;
        case '含早餐':
            facilities.push(...randomSubset(FACILITY_GROUPS.breakfast.tags.filter(t => t !== primaryTag), 0, 2));
            break;
        case '健身房':
            facilities.push(...randomSubset(FACILITY_GROUPS.fitness.tags.filter(t => t !== primaryTag), 1, 3));
            break;
    }

    // 根据星级添加额外设施
    if (starRating >= 4) {
        if (Math.random() > 0.3) facilities.push(...randomSubset(FACILITY_GROUPS.pool.tags, 1, 2));
        if (Math.random() > 0.3) facilities.push(...randomSubset(FACILITY_GROUPS.spa.tags, 1, 2));
    }
    if (starRating >= 3) {
        facilities.push(...randomSubset(FACILITY_GROUPS.dining.tags, 1, 2));
    }
    if (Math.random() > 0.5) {
        facilities.push(...randomSubset(FACILITY_GROUPS.meeting.tags, 1, 1));
    }

    // 去重
    return [...new Set(facilities)];
}

// ========== 房型生成 ==========

function generateRoomTypes(hotelIndex: number, starRating: number, cityIndex: number = 0): SeedRoomType[] {
    const priceMultiplier = starRating * 0.4 + 0.6; // 1星=1.0, 5星=2.6
    const roomCount = randomInt(2, 4);

    // 根据星级选择合适的房型配置
    const availableConfigs = ROOM_TYPE_CONFIGS.filter(config => {
        if (starRating <= 2) return config.priceBase <= 300;
        if (starRating === 3) return config.priceBase <= 600;
        if (starRating === 4) return config.priceBase <= 1000;
        return true;
    });

    const selectedConfigs = randomSubset(availableConfigs, roomCount, roomCount);

    return selectedConfigs.map((config, roomIndex) => {
        const basePrice = Math.round(config.priceBase * priceMultiplier);
        const variation = randomInt(-30, 80);
        const price = Math.max(100, basePrice + variation);
        const originalPrice = Math.round(price * (1 + Math.random() * 0.25));
        const roomSize = randomInt(config.sizeMin, config.sizeMax);

        return {
            name: config.name,
            price,
            originalPrice,
            maxGuests: config.maxGuests,
            bedType: config.bedType,
            roomSize,
            description: `${config.name}，${config.bedType}，面积${roomSize}㎡`,
            imageUrl: getRoomImageByType(config.name, hotelIndex, roomIndex, cityIndex),
        };
    });
}

// ========== 主生成函数 ==========

export interface GenerateHotelsOptions {
    count: number;
    startIndex?: number;
}

/**
 * 生成指定数量的测试酒店
 * @param options 生成选项
 * @returns 酒店数组
 */
export function generateHotels(options: GenerateHotelsOptions): SeedHotel[] {
    const { count, startIndex = 0 } = options;
    const hotels: SeedHotel[] = [];

    for (let i = 0; i < count; i++) {
        const index = startIndex + i;
        const cityIndex = index % ALL_CITIES.length;
        const city = ALL_CITIES[cityIndex];
        const starRating = ((index % 5) + 1) as 1 | 2 | 3 | 4 | 5;

        const { nameCn, nameEn } = generateHotelName(city, starRating, index);
        const facilities = generateFacilities(index, starRating);
        const roomTypes = generateRoomTypes(index, starRating, cityIndex);
        // 使用新的生成函数，传入 hotelIndex 和 cityIndex
        const images = generateHotelImages(index, cityIndex, randomInt(2, 4));

        hotels.push({
            nameCn,
            nameEn,
            address: `${city}市${randomFrom(STREET_NAMES)}${randomInt(1, 999)}号`,
            starRating,
            openingDate: `${2012 + randomInt(0, 14)}-${String(randomInt(1, 12)).padStart(2, '0')}-01`,
            description: `位于${city}核心地段的优质酒店，设施完善，服务周到。${facilities.slice(0, 3).join('、')}等设施一应俱全。`,
            facilities,
            nearbyAttractions: [`${city}地标`, '商业中心', '地铁站'],
            transportation: [`地铁${randomInt(1, 10)}号线`, '公交便利'],
            status: 'approved',
            roomTypes,
            images,
        });
    }

    return hotels;
}

/**
 * 打印生成统计信息
 */
export function printGenerationStats(hotels: SeedHotel[]): void {
    const stats = {
        total: hotels.length,
        byTag: {} as Record<string, number>,
        byStar: {} as Record<number, number>,
        priceRanges: {
            under300: 0,
            '300-500': 0,
            '500-800': 0,
            '800-1500': 0,
            over1500: 0,
        },
    };

    for (const hotel of hotels) {
        // 统计标签
        for (const tag of FILTER_TAGS) {
            if (hotel.facilities.some(f => f.includes(tag))) {
                stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
            }
        }

        // 统计星级
        stats.byStar[hotel.starRating] = (stats.byStar[hotel.starRating] || 0) + 1;

        // 统计价格
        const minPrice = Math.min(...hotel.roomTypes.map(r => r.price));
        if (minPrice < 300) stats.priceRanges.under300++;
        else if (minPrice < 500) stats.priceRanges['300-500']++;
        else if (minPrice < 800) stats.priceRanges['500-800']++;
        else if (minPrice < 1500) stats.priceRanges['800-1500']++;
        else stats.priceRanges.over1500++;
    }

    console.log('\n📊 生成统计:');
    console.log(`   总数: ${stats.total}`);
    console.log('\n   📌 标签分布:');
    for (const [tag, count] of Object.entries(stats.byTag)) {
        console.log(`      ${tag}: ${count} (${((count / stats.total) * 100).toFixed(1)}%)`);
    }
    console.log('\n   ⭐ 星级分布:');
    for (let star = 1; star <= 5; star++) {
        console.log(`      ${star}星: ${stats.byStar[star] || 0}`);
    }
    console.log('\n   💰 价格分布:');
    console.log(`      <300元: ${stats.priceRanges.under300} (${((stats.priceRanges.under300 / stats.total) * 100).toFixed(1)}%)`);
    console.log(`      300-500元: ${stats.priceRanges['300-500']} (${((stats.priceRanges['300-500'] / stats.total) * 100).toFixed(1)}%)`);
    console.log(`      500-800元: ${stats.priceRanges['500-800']} (${((stats.priceRanges['500-800'] / stats.total) * 100).toFixed(1)}%)`);
    console.log(`      800-1500元: ${stats.priceRanges['800-1500']} (${((stats.priceRanges['800-1500'] / stats.total) * 100).toFixed(1)}%)`);
    console.log(`      >1500元: ${stats.priceRanges.over1500} (${((stats.priceRanges.over1500 / stats.total) * 100).toFixed(1)}%)`);
}
