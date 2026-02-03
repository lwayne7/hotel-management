/**
 * 酒店图片库 - 精选Unsplash酒店相关图片
 * 
 * 统一管理种子数据使用的图片URL，确保图片与酒店内容相关
 * 使用 hotelId + cityIndex 作为种子确保不同城市有不同图片
 */

// 酒店外观图片 - 扩展到20张以增加多样性
export const HOTEL_EXTERIOR_IMAGES = [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', // 现代酒店外观
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', // 豪华酒店大堂入口
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', // 度假酒店外观
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', // 海滨酒店
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', // 城市精品酒店
    'https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=800', // 商务酒店外观
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', // 酒店建筑
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', // 度假村
    'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800', // 热带度假村
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', // 湖畔酒店
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', // 现代建筑酒店
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', // 欧式酒店外观
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800', // 山景酒店
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', // 城市高楼酒店
    'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=800', // 海边度假酒店
    'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800', // 夜景酒店
    'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', // 古典酒店
    'https://images.unsplash.com/photo-1520483691742-bada60a1edd6?w=800', // 花园酒店
    'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800', // 泳池酒店
    'https://images.unsplash.com/photo-1587213811864-46e59f6873b1?w=800', // 精品酒店
];

// 酒店大堂/公共区域图片 - 扩展到10张
export const HOTEL_LOBBY_IMAGES = [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', // 现代大堂
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', // 豪华大堂
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', // 酒店接待
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', // 休息区
    'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=800', // 大堂休息区
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800', // 现代接待台
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', // 温馨大堂
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', // 欧式大堂
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', // 简约大堂
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800', // 精品大堂
];

// 泳池/SPA图片 - 扩展到8张
export const HOTEL_POOL_IMAGES = [
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', // 无边泳池
    'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800', // 室外泳池
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', // 度假村泳池
    'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800', // 屋顶泳池
    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800', // 室内泳池
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', // 豪华泳池
    'https://images.unsplash.com/photo-1573544269041-9a44b0a8a19a?w=800', // SPA区域
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', // 夜景泳池
];

// ========== 房型特定图片 ==========

// 大床房图片 (King Bed) - 明显的大床，扩展到10张
export const KING_BED_ROOM_IMAGES = [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', // 豪华大床
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', // 现代大床房
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', // 舒适大床
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800', // 景观大床房
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', // 简约大床
    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800', // 现代风格大床
    'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=800', // 温馨大床
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', // 商务大床房
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', // 欧式大床
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', // 豪华景观大床
];

// 双床房图片 (Twin Beds) - 两张单人床，扩展到8张
export const TWIN_BED_ROOM_IMAGES = [
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', // 双床房间
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', // 标准双床
    'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=800', // 温馨双床房
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', // 简洁双床
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800', // 商务双床房
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', // 度假双床
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', // 现代双床
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800', // 景观双床
];

// 套房图片 (Suite) - 带客厅的大房间，扩展到8张
export const SUITE_ROOM_IMAGES = [
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', // 豪华套房客厅
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', // 行政套房
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800', // 总统套房
    'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800', // 景观套房
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', // 现代套房
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', // 大型套房
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', // 欧式套房
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', // 商务套房
];

// 亲子/家庭房图片 (Family Room) - 宽敞明亮，扩展到6张
export const FAMILY_ROOM_IMAGES = [
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', // 宽敞家庭房
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', // 温馨家庭房
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800', // 亲子主题房
    'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=800', // 大空间家庭房
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', // 多床家庭房
    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800', // 现代家庭房
];

// 标准间图片，扩展到6张
export const STANDARD_ROOM_IMAGES = [
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', // 标准客房
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', // 基础房型
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', // 简洁标间
    'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=800', // 温馨标间
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', // 商务标间
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', // 度假标间
];

// 通用房间图片（备用）- 组合所有房型图片
export const HOTEL_ROOM_IMAGES = [
    ...KING_BED_ROOM_IMAGES,
    ...TWIN_BED_ROOM_IMAGES,
    ...SUITE_ROOM_IMAGES,
    ...FAMILY_ROOM_IMAGES,
];

// ========== 基于种子的图片选择函数 ==========

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

/**
 * 计算唯一图片种子
 * 使用 hotelId + cityIndex 确保不同城市有不同图片
 */
function calculateImageSeed(hotelId: number, cityIndex: number = 0): number {
    // 使用质数混合确保更好的分布
    return hotelId * 31 + cityIndex * 7919 + 17;
}

/**
 * 根据房型名称和种子获取对应图片
 * 使用种子确保同一酒店的同一房型总是相同图片
 */
export function getRoomImageByType(roomTypeName: string, hotelId: number, roomIndex: number = 0, cityIndex: number = 0): string {
    const name = roomTypeName.toLowerCase();
    const seed = calculateImageSeed(hotelId, cityIndex) + roomIndex * 37;
    const rng = seededRandom(seed);
    
    // 套房类型
    if (name.includes('套房') || name.includes('suite')) {
        const idx = Math.floor(rng() * SUITE_ROOM_IMAGES.length);
        return SUITE_ROOM_IMAGES[idx];
    }

    // 亲子/家庭房
    if (name.includes('亲子') || name.includes('家庭') || name.includes('family')) {
        const idx = Math.floor(rng() * FAMILY_ROOM_IMAGES.length);
        return FAMILY_ROOM_IMAGES[idx];
    }

    // 双床房
    if (name.includes('双床') || name.includes('标准间') || name.includes('twin')) {
        const idx = Math.floor(rng() * TWIN_BED_ROOM_IMAGES.length);
        return TWIN_BED_ROOM_IMAGES[idx];
    }

    // 大床房
    if (name.includes('大床') || name.includes('king') || name.includes('豪华')) {
        const idx = Math.floor(rng() * KING_BED_ROOM_IMAGES.length);
        return KING_BED_ROOM_IMAGES[idx];
    }

    // 标准间
    if (name.includes('标准')) {
        const idx = Math.floor(rng() * STANDARD_ROOM_IMAGES.length);
        return STANDARD_ROOM_IMAGES[idx];
    }

    // 默认使用大床房图片
    const idx = Math.floor(rng() * KING_BED_ROOM_IMAGES.length);
    return KING_BED_ROOM_IMAGES[idx];
}

/**
 * 根据酒店ID和城市索引获取外观图片
 */
export function getExteriorImage(hotelId: number, cityIndex: number = 0): string {
    const seed = calculateImageSeed(hotelId, cityIndex);
    const rng = seededRandom(seed);
    const idx = Math.floor(rng() * HOTEL_EXTERIOR_IMAGES.length);
    return HOTEL_EXTERIOR_IMAGES[idx];
}

/**
 * 根据酒店ID和城市索引获取房间图片（通用）
 */
export function getRoomImage(hotelId: number, cityIndex: number = 0): string {
    const seed = calculateImageSeed(hotelId, cityIndex) + 100;
    const rng = seededRandom(seed);
    const idx = Math.floor(rng() * HOTEL_ROOM_IMAGES.length);
    return HOTEL_ROOM_IMAGES[idx];
}

/**
 * 根据酒店ID和城市索引获取大堂图片
 */
export function getLobbyImage(hotelId: number, cityIndex: number = 0): string {
    const seed = calculateImageSeed(hotelId, cityIndex) + 200;
    const rng = seededRandom(seed);
    const idx = Math.floor(rng() * HOTEL_LOBBY_IMAGES.length);
    return HOTEL_LOBBY_IMAGES[idx];
}

/**
 * 根据酒店ID和城市索引获取泳池图片
 */
export function getPoolImage(hotelId: number, cityIndex: number = 0): string {
    const seed = calculateImageSeed(hotelId, cityIndex) + 300;
    const rng = seededRandom(seed);
    const idx = Math.floor(rng() * HOTEL_POOL_IMAGES.length);
    return HOTEL_POOL_IMAGES[idx];
}

/**
 * 生成酒店图片数组
 * 使用 hotelId + cityIndex 确保不同城市有不同图片组合
 */
export function generateHotelImages(
    hotelId: number, 
    cityIndex: number = 0, 
    count: number = 3
): { imageUrl: string; description: string }[] {
    const images: { imageUrl: string; description: string }[] = [];

    images.push({
        imageUrl: getExteriorImage(hotelId, cityIndex),
        description: '酒店外观'
    });

    if (count >= 2) {
        images.push({
            imageUrl: getLobbyImage(hotelId, cityIndex),
            description: '酒店大堂'
        });
    }

    if (count >= 3) {
        images.push({
            imageUrl: getRoomImage(hotelId, cityIndex),
            description: '豪华客房'
        });
    }

    if (count >= 4) {
        images.push({
            imageUrl: getPoolImage(hotelId, cityIndex),
            description: '泳池设施'
        });
    }

    return images;
}

/**
 * 生成房型图片
 * 根据房型名称匹配合适的图片，使用种子确保唯一性
 */
export function generateRoomTypeImage(
    hotelId: number, 
    roomTypeIndex: number, 
    roomTypeName?: string,
    cityIndex: number = 0
): string {
    if (roomTypeName) {
        return getRoomImageByType(roomTypeName, hotelId, roomTypeIndex, cityIndex);
    }
    const seed = calculateImageSeed(hotelId, cityIndex) + roomTypeIndex * 50;
    const rng = seededRandom(seed);
    const idx = Math.floor(rng() * HOTEL_ROOM_IMAGES.length);
    return HOTEL_ROOM_IMAGES[idx];
}
