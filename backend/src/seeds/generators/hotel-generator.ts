/**
 * 酒店生成器
 * 批量生成测试酒店数据，确保筛选标签均匀分布
 * 使用 hotelId + cityIndex 作为种子确保不同城市有不同图片
 *
 * 优化策略：
 * 1. 确保每个城市都有各种星级（1-5星）
 * 2. 确保每个城市都有各种价格区间
 * 3. 确保每个城市都有各种设施标签
 * 4. 对齐前端所有筛选项
 * 5. 确保图片唯一性
 */
import { SeedHotel, SeedRoomType } from '../config/types';
import {
  ALL_CITIES,
  FACILITY_GROUPS,
  FILTER_TAGS,
  HOT_FILTER_TAGS,
  HOTEL_FEATURES,
  ROOM_FEATURES,
  FACILITY_SERVICES,
  FRONTEND_BRANDS,
  ROOM_TYPE_CONFIGS,
  HOTEL_BRANDS,
  HOTEL_SUFFIXES,
  STREET_NAMES,
} from '../config/constants';
import {
  getRoomImageByType,
  generateHotelImages,
} from '../images/hotel-images';

// ========== 基于种子的随机数生成器 ==========

/**
 * 基于种子的伪随机数生成器 (LCG算法)
 * 确保相同的种子产生相同的随机序列
 */
function seededRandom(seed: number): () => number {
  let state = Math.abs(seed) || 1;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ========== 工具函数 ==========

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomFrom<T>(rng: () => number, arr: T[]): T {
  return arr[randomInt(rng, 0, arr.length - 1)];
}

function randomSubset<T>(
  rng: () => number,
  arr: T[],
  min: number,
  max: number,
): T[] {
  const count = randomInt(rng, min, max);
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

// ========== 名称生成 ==========

function getHotelBrandsByStarRating(starRating: number): string[] {
  switch (starRating) {
    case 5:
      return [...HOTEL_BRANDS.luxury, ...HOTEL_BRANDS.upscale];
    case 4:
      return [...HOTEL_BRANDS.upscale, ...HOTEL_BRANDS.midUpscale];
    case 3:
      return [...HOTEL_BRANDS.midUpscale, ...HOTEL_BRANDS.economy];
    default:
      return HOTEL_BRANDS.economy;
  }
}

function generateHotelName(
  rng: () => number,
  city: string,
  starRating: number,
  index: number,
): { nameCn: string; nameEn: string } {
  const brands = getHotelBrandsByStarRating(starRating);
  // 优先使用前端品牌列表中的品牌（如果匹配星级）
  const frontendBrandsForStar = FRONTEND_BRANDS.filter((brand) => {
    // 根据品牌判断星级范围
    const luxuryBrands = [
      '洲际',
      '凯悦',
      '希尔顿',
      '喜来登',
      '万豪',
      '香格里拉',
      '四季',
    ];
    const midBrands = ['亚朵', '全季'];
    const economyBrands = ['如家', '汉庭', '维也纳', '锦江之星'];

    if (starRating >= 4 && luxuryBrands.includes(brand)) return true;
    if (starRating === 3 && midBrands.includes(brand)) return true;
    if (starRating <= 2 && economyBrands.includes(brand)) return true;
    return false;
  });

  // 如果前端品牌列表中有匹配的，优先使用
  const availableBrands =
    frontendBrandsForStar.length > 0 ? frontendBrandsForStar : brands;
  const brand = availableBrands[Math.floor(rng() * availableBrands.length)];

  const suffixIndex =
    Math.floor(index / availableBrands.length) % HOTEL_SUFFIXES.length;
  const suffix = HOTEL_SUFFIXES[suffixIndex];
  // 为避免重名，在名称后加上编号（当索引较大时）
  const suffix2 =
    index >= availableBrands.length * HOTEL_SUFFIXES.length
      ? `${Math.floor(index / (availableBrands.length * HOTEL_SUFFIXES.length)) + 1}号店`
      : '';

  return {
    nameCn: `${city}${brand}${suffix}${suffix2}`,
    nameEn: `${brand} Hotel ${city} ${index + 1}`,
  };
}

/**
 * 根据索引生成设施标签，确保每个主标签有足够数量
 * 对齐前端所有筛选项
 * @param seed 种子值（用于确定性随机）
 * @param starRating 星级
 * @param cityIndex 城市索引
 */
function generateFacilities(
  seed: number,
  starRating: number,
  cityIndex: number,
): string[] {
  const rng = seededRandom(seed);
  const facilities: string[] = ['免费WiFi', '24小时前台'];

  // 使用更复杂的算法确保每个城市都有各种标签
  // 使用 cityIndex * 7 + seed 确保不同城市有不同的标签分布
  const tagSeed = cityIndex * 7 + Math.floor(seed / 100);
  const tagRng = seededRandom(tagSeed);

  // 根据种子决定主标签（确保标签均匀分布）
  const tagIndex = Math.floor(tagRng() * FILTER_TAGS.length);
  const primaryTag = FILTER_TAGS[tagIndex];

  // 总是添加主标签（确保筛选一定能匹配到）
  facilities.push(primaryTag);

  // 根据主标签添加相关设施
  switch (primaryTag) {
    case '亲子':
      facilities.push(
        ...randomSubset(
          rng,
          FACILITY_GROUPS.family.tags.filter((t) => t !== primaryTag),
          1,
          3,
        ),
      );
      break;
    case '豪华':
      facilities.push(
        ...randomSubset(
          rng,
          FACILITY_GROUPS.luxury.tags.filter((t) => t !== primaryTag),
          1,
          3,
        ),
      );
      break;
    case '免费停车场':
      facilities.push(
        ...randomSubset(
          rng,
          FACILITY_GROUPS.parking.tags.filter((t) => t !== primaryTag),
          0,
          2,
        ),
      );
      break;
    case '含早餐':
      facilities.push(
        ...randomSubset(
          rng,
          FACILITY_GROUPS.breakfast.tags.filter((t) => t !== primaryTag),
          0,
          2,
        ),
      );
      break;
    case '健身房':
      facilities.push(
        ...randomSubset(
          rng,
          FACILITY_GROUPS.fitness.tags.filter((t) => t !== primaryTag),
          1,
          3,
        ),
      );
      break;
    case '近地铁':
      facilities.push(
        ...randomSubset(rng, FACILITY_GROUPS.metro?.tags || ['近地铁'], 0, 2),
      );
      break;
    case '游泳池':
      facilities.push(
        ...randomSubset(
          rng,
          FACILITY_GROUPS.pool.tags.filter((t) => t !== primaryTag),
          0,
          2,
        ),
      );
      break;
  }

  // 根据星级添加额外设施（使用确定性随机）
  if (starRating >= 4) {
    if (rng() > 0.3)
      facilities.push(...randomSubset(rng, FACILITY_GROUPS.pool.tags, 1, 2));
    if (rng() > 0.3)
      facilities.push(...randomSubset(rng, FACILITY_GROUPS.spa.tags, 1, 2));
  }
  if (starRating >= 3) {
    facilities.push(...randomSubset(rng, FACILITY_GROUPS.dining.tags, 1, 2));
  }
  if (rng() > 0.5) {
    facilities.push(...randomSubset(rng, FACILITY_GROUPS.meeting.tags, 1, 1));
  }

  // 去重
  return [...new Set(facilities)];
}

// ========== 房型生成 ==========

/**
 * 生成房型，确保对齐前端客房特色筛选项
 * @param seed 种子值
 * @param hotelIndex 酒店索引
 * @param starRating 星级
 * @param cityIndex 城市索引
 * @param facilities 酒店设施（用于匹配房型）
 */
function generateRoomTypes(
  seed: number,
  hotelIndex: number,
  starRating: number,
  cityIndex: number = 0,
  facilities: string[] = [],
): SeedRoomType[] {
  const rng = seededRandom(seed);
  const priceMultiplier = starRating * 0.4 + 0.6; // 1星=1.0, 5星=2.6
  const roomCount = randomInt(rng, 2, 4);

  // 根据星级选择合适的房型配置
  const availableConfigs = ROOM_TYPE_CONFIGS.filter((config) => {
    if (starRating <= 2) return config.priceBase <= 300;
    if (starRating === 3) return config.priceBase <= 600;
    if (starRating === 4) return config.priceBase <= 1000;
    return true;
  });

  // 先选择基础房型配置
  const selectedConfigs = randomSubset(
    rng,
    availableConfigs,
    roomCount,
    roomCount,
  );

  // 如果酒店有亲子标签，确保至少有一个家庭房或亲子主题房
  const hasFamilyTag = facilities.some((f) => f.includes('亲子'));
  if (hasFamilyTag) {
    const familyConfigs = availableConfigs.filter(
      (c) => c.name.includes('家庭') || c.name.includes('亲子'),
    );
    if (familyConfigs.length > 0) {
      const hasFamilyRoom = selectedConfigs.some(
        (c) => c.name.includes('家庭') || c.name.includes('亲子'),
      );
      if (!hasFamilyRoom) {
        // 替换第一个为家庭房
        selectedConfigs[0] = randomFrom(rng, familyConfigs);
      }
    }
  }

  // 确保至少有一个大床房或双床房（对齐前端筛选项）
  const hasBigBed = selectedConfigs.some((c) => c.name.includes('大床'));
  const hasTwinBed = selectedConfigs.some(
    (c) => c.name.includes('双床') || c.name.includes('标准'),
  );
  if (!hasBigBed && !hasTwinBed) {
    // 如果没有大床或双床，添加一个
    const bedConfigs = availableConfigs.filter(
      (c) =>
        c.name.includes('大床') ||
        c.name.includes('双床') ||
        c.name.includes('标准'),
    );
    if (bedConfigs.length > 0) {
      selectedConfigs[0] = randomFrom(rng, bedConfigs);
    }
  }

  // 使用唯一种子确保每个房型图片都不一样
  return selectedConfigs.map((config, roomIndex) => {
    const basePrice = Math.round(config.priceBase * priceMultiplier);
    const variation = randomInt(rng, -30, 80);
    const price = Math.max(100, basePrice + variation);
    const originalPrice = Math.round(price * (1 + rng() * 0.25));
    const roomSize = randomInt(rng, config.sizeMin, config.sizeMax);

    // 房型图片按名称匹配语义（套房/大床/双床/家庭等），hotelIndex 作 id 保证唯一
    const imageUrl = getRoomImageByType(
      config.name,
      hotelIndex,
      roomIndex,
      cityIndex,
    );

    return {
      name: config.name,
      price,
      originalPrice,
      maxGuests: config.maxGuests,
      bedType: config.bedType,
      roomSize,
      description: `${config.name}，${config.bedType}，面积${roomSize}㎡`,
      imageUrl,
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
 * 优化策略：确保每个城市都有各种星级、价格区间、设施标签
 * @param options 生成选项
 * @returns 酒店数组
 */
export function generateHotels(options: GenerateHotelsOptions): SeedHotel[] {
  const { count, startIndex = 0 } = options;
  const hotels: SeedHotel[] = [];

  // 为每个城市分配星级分布，确保每个城市都有1-5星
  const starsPerCity = Math.ceil(count / ALL_CITIES.length);
  const starsDistribution: Record<number, number[]> = {};

  // 初始化每个城市的星级分布
  for (let c = 0; c < ALL_CITIES.length; c++) {
    starsDistribution[c] = [];
    // 为每个城市分配各种星级
    for (let star = 1; star <= 5; star++) {
      const countForStar =
        Math.floor(starsPerCity / 5) + (star <= starsPerCity % 5 ? 1 : 0);
      for (let i = 0; i < countForStar; i++) {
        starsDistribution[c].push(star);
      }
    }
    // 使用基于种子的随机数打乱顺序（确保结果可重复）
    const shuffleRng = seededRandom(c * 1000 + startIndex);
    starsDistribution[c].sort(() => shuffleRng() - 0.5);
  }

  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    const cityIndex = index % ALL_CITIES.length;
    const city = ALL_CITIES[cityIndex];

    // 使用城市内的索引来决定星级，确保每个城市都有各种星级
    const cityHotelIndex = Math.floor(index / ALL_CITIES.length);
    const cityStars = starsDistribution[cityIndex];
    const starRating = (cityStars[cityHotelIndex % cityStars.length] ||
      (cityHotelIndex % 5) + 1) as 1 | 2 | 3 | 4 | 5;

    // 使用唯一种子确保数据确定性
    const seed = index * 7919 + cityIndex * 31 + starRating * 7;
    const rng = seededRandom(seed);

    const { nameCn, nameEn } = generateHotelName(rng, city, starRating, index);
    const facilities = generateFacilities(seed, starRating, cityIndex);
    const roomTypes = generateRoomTypes(
      seed,
      index,
      starRating,
      cityIndex,
      facilities,
    );

    // 使用唯一种子确保图片唯一性
    const imageSeed = index * 10000 + cityIndex * 1000 + starRating * 100;
    const imageCount = randomInt(rng, 2, 4);
    const images = generateHotelImages(imageSeed, cityIndex, imageCount);

    hotels.push({
      nameCn,
      nameEn,
      address: `${city}市${randomFrom(rng, STREET_NAMES)}${randomInt(rng, 1, 999)}号`,
      starRating,
      openingDate: `${2012 + randomInt(rng, 0, 14)}-${String(randomInt(rng, 1, 12)).padStart(2, '0')}-01`,
      description: `位于${city}核心地段的优质酒店，设施完善，服务周到。${facilities.slice(0, 3).join('、')}等设施一应俱全。`,
      facilities,
      nearbyAttractions: [`${city}地标`, '商业中心', '地铁站'],
      transportation: [`地铁${randomInt(rng, 1, 10)}号线`, '公交便利'],
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
      if (hotel.facilities.some((f) => f.includes(tag))) {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      }
    }

    // 统计星级
    stats.byStar[hotel.starRating] = (stats.byStar[hotel.starRating] || 0) + 1;

    // 统计价格
    const minPrice = Math.min(...hotel.roomTypes.map((r) => r.price));
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
    console.log(
      `      ${tag}: ${count} (${((count / stats.total) * 100).toFixed(1)}%)`,
    );
  }
  console.log('\n   ⭐ 星级分布:');
  for (let star = 1; star <= 5; star++) {
    console.log(`      ${star}星: ${stats.byStar[star] || 0}`);
  }
  console.log('\n   💰 价格分布:');
  console.log(
    `      <300元: ${stats.priceRanges.under300} (${((stats.priceRanges.under300 / stats.total) * 100).toFixed(1)}%)`,
  );
  console.log(
    `      300-500元: ${stats.priceRanges['300-500']} (${((stats.priceRanges['300-500'] / stats.total) * 100).toFixed(1)}%)`,
  );
  console.log(
    `      500-800元: ${stats.priceRanges['500-800']} (${((stats.priceRanges['500-800'] / stats.total) * 100).toFixed(1)}%)`,
  );
  console.log(
    `      800-1500元: ${stats.priceRanges['800-1500']} (${((stats.priceRanges['800-1500'] / stats.total) * 100).toFixed(1)}%)`,
  );
  console.log(
    `      >1500元: ${stats.priceRanges.over1500} (${((stats.priceRanges.over1500 / stats.total) * 100).toFixed(1)}%)`,
  );
}
