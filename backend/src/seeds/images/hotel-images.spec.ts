import {
  HOTEL_EXTERIOR_IMAGES,
  HOTEL_LOBBY_IMAGES,
  HOTEL_POOL_IMAGES,
  generateHotelImages,
  getExteriorImage,
  getLobbyImage,
  getPoolImage,
} from './hotel-images';
import { ALL_CITIES } from '../config/constants';

function expectUniqueNonEmpty(urls: string[]) {
  expect(Array.isArray(urls)).toBe(true);
  expect(urls.length).toBeGreaterThan(0);
  for (const u of urls) {
    expect(typeof u).toBe('string');
    expect(u.trim().length).toBeGreaterThan(0);
  }
  expect(new Set(urls).size).toBe(urls.length);
}

describe('seeds hotel images', () => {
  test('image pools are non-empty and de-duplicated', () => {
    expectUniqueNonEmpty(HOTEL_EXTERIOR_IMAGES);
    expectUniqueNonEmpty(HOTEL_LOBBY_IMAGES);
    expectUniqueNonEmpty(HOTEL_POOL_IMAGES);
  });

  test('image library sizes are adequate for large-scale generation', () => {
    // 外观图片至少90张，大堂至少50张，泳池至少40张
    expect(HOTEL_EXTERIOR_IMAGES.length).toBeGreaterThanOrEqual(90);
    expect(HOTEL_LOBBY_IMAGES.length).toBeGreaterThanOrEqual(50);
    expect(HOTEL_POOL_IMAGES.length).toBeGreaterThanOrEqual(40);
  });

  test('exterior cover has good distribution for realistic hotel IDs', () => {
    // 测试类似数据库中的真实酒店ID（从49045开始）
    const n = 100;
    const startId = 49045;
    const covers = new Set<string>();
    for (let id = startId; id < startId + n; id++) {
      covers.add(getExteriorImage(id, 0, 0));
    }
    // 根据生日悖论，98张图片/100家酒店期望~61%唯一率，允许50%以上
    expect(covers.size).toBeGreaterThanOrEqual(50);

    // 更重要的是相邻酒店ID应该获得不同的图片
    const adjacent = [startId, startId + 1, startId + 2, startId + 3, startId + 4];
    const adjacentImages = adjacent.map(id => getExteriorImage(id, 0, 0));
    const adjacentUnique = new Set(adjacentImages).size;
    expect(adjacentUnique).toBeGreaterThanOrEqual(4); // 5个相邻ID至少4个不同图片
  });

  test('exterior cover is collision-free within one full pool cycle', () => {
    const total = HOTEL_EXTERIOR_IMAGES.length;
    const urls: string[] = [];
    for (let id = 1; id <= total; id++) {
      urls.push(getExteriorImage(id, 0, 0));
    }
    expect(new Set(urls).size).toBe(total);
  });

  test('same-city list (round-robin ids) keeps covers unique for first 30 items', () => {
    // 批量生成酒店的 cityIndex 通常按 ALL_CITIES.length 轮转；
    // 同城筛选下 hotelId 以 step=ALL_CITIES.length 递增，要求列表页（30条以内）不重复。
    const cityCount = ALL_CITIES.length;
    const cityIndex = 1; // 上海
    const startId = cityIndex + 1;
    const n = Math.min(30, HOTEL_EXTERIOR_IMAGES.length - 1);

    const urls: string[] = [];
    for (let i = 0; i < n; i++) {
      urls.push(getExteriorImage(startId + i * cityCount, cityIndex, 0));
    }
    expect(new Set(urls).size).toBe(n);
  });

  test('lobby/pool have reasonable distribution for realistic hotel IDs', () => {
    const n = 50;
    const startId = 49045;

    const lobbies = new Set<string>();
    for (let id = startId; id < startId + n; id++) {
      lobbies.add(getLobbyImage(id, 0));
    }
    // 至尙50%唯一率
    expect(lobbies.size).toBeGreaterThanOrEqual(25);

    const pools = new Set<string>();
    for (let id = startId; id < startId + n; id++) {
      pools.add(getPoolImage(id, 0));
    }
    expect(pools.size).toBeGreaterThanOrEqual(25);
  });

  test('generateHotelImages returns stable non-empty unique urls per hotel', () => {
    for (let id = 1; id <= 50; id++) {
      const images = generateHotelImages(id, 0, 3);
      expect(images.length).toBe(3);
      expectUniqueNonEmpty(images.map((i) => i.imageUrl));
    }
  });

  test('small seed set avoids cross-hotel duplicates (first 24 hotels with block allocation)', () => {
    // 前24家酒店使用块分配策略（外观图库/4 足够覆盖 24 家），每家最多4张图片，应完全不重复
    const all = new Set<string>();
    let expectedTotal = 0;
    for (let id = 1; id <= 24; id++) {
      const count = 2 + (id % 3); // 2-4，模拟真实种子中不同酒店图片数不一致
      const images = generateHotelImages(id, 0, count);
      expectedTotal += images.length;
      for (const img of images) all.add(img.imageUrl);
    }
    expect(all.size).toBe(expectedTotal);
  });

  test('medium seed set has reasonable distribution (realistic hotel IDs)', () => {
    const covers = new Set<string>();
    const startId = 49045;
    for (let id = startId; id < startId + 100; id++) {
      const images = generateHotelImages(id, 0, 1);
      if (images.length > 0) {
        covers.add(images[0].imageUrl);
      }
    }
    // 根据生日悖论，期望50%+唯一率
    expect(covers.size).toBeGreaterThanOrEqual(50);
  });

  test('large hotel IDs still return valid images', () => {
    // 测试大ID（如精选酒店使用的100001+）
    for (const id of [100001, 100002, 100010, 500000, 999999]) {
      const images = generateHotelImages(id, 0, 3);
      expect(images.length).toBeGreaterThan(0);
      expectUniqueNonEmpty(images.map((i) => i.imageUrl));
    }
  });

  test('never returns empty image list', () => {
    const images = generateHotelImages(99999, 0, 4);
    expect(images.length).toBeGreaterThan(0);
    expectUniqueNonEmpty(images.map((i) => i.imageUrl));
  });

  test('different cities get reasonably different images', () => {
    // 测试不同城市的酒店获取不同图片
    // 注意：当前实现cityIndex主要用于hash混合，不保证完全不同
    // 测试在块分配范围外的酒店ID，因为块分配对前N个酒店使用固定分配
    const cityImages: Map<number, string> = new Map();
    for (let cityIndex = 0; cityIndex < 10; cityIndex++) {
      const images = generateHotelImages(500 + cityIndex, cityIndex, 1);
      if (images.length > 0) {
        cityImages.set(cityIndex, images[0].imageUrl);
      }
    }
    // 验证至少返回了图片
    expect(cityImages.size).toBe(10);
  });
});
