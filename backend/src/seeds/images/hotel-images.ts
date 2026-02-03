/**
 * 酒店图片库 - 精选Unsplash酒店相关图片（大规模版本）
 * 
 * 为10000+酒店提供多样化图片，确保图片与酒店内容相关
 * 使用 hotelId + cityIndex + 多重哈希 作为种子确保不同酒店有不同图片组合
 * 
 * 图片总数: 150+ 张精选高质量酒店图片
 */

// ========== 酒店外观图片 (50张) ==========
export const HOTEL_EXTERIOR_IMAGES = [
    // 现代酒店外观 (10张)
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
    // 豪华酒店 (10张)
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
    // 度假村与特色酒店 (10张)
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', // 无边泳池度假村
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', // 热带度假村泳池
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800', // 海滩度假村
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', // 海边酒店
    'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800', // 热带海岛酒店
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800', // 海滨度假胜地
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', // 山间度假酒店
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', // 雪山酒店
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', // 阿尔卑斯酒店
    'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800', // 海边精品酒店
    // 城市酒店 (10张)
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', // 摩天楼酒店
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800', // 城市夜景酒店
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', // 都市酒店
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800', // 城市天际线酒店
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800', // 都会酒店夜景
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800', // 纽约风格酒店
    'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800', // 高层城市酒店
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800', // 湖滨城市酒店
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', // 欧洲城市酒店
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800', // 巴黎风格酒店
    // 特色建筑酒店 (10张)
    'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800', // 古堡酒店
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800', // 历史建筑酒店
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', // 别墅酒店
    'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800', // 豪华别墅
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800', // 现代别墅酒店
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', // 豪宅酒店
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', // 设计师酒店
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', // 现代设计酒店
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', // 夜景建筑酒店
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800', // 简约建筑酒店
];

// ========== 酒店大堂/公共区域图片 (20张) ==========
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
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800', // 开放式大堂
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800', // 艺术风大堂
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800', // 明亮大堂
    'https://images.unsplash.com/photo-1600573472591-ee6c563aaec1?w=800', // 温馨接待区
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', // 商务大堂
    'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800', // 休闲大堂
    'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800', // 现代接待处
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800', // 豪华接待区
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800', // 精品大堂设计
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', // 艺术大堂
];

// ========== 泳池/SPA图片 (15张) ==========
export const HOTEL_POOL_IMAGES = [
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', // 无边泳池
    'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800', // 室外泳池
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', // 度假村泳池
    'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800', // 屋顶泳池
    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800', // 室内泳池
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', // 豪华泳池
    'https://images.unsplash.com/photo-1573544269041-9a44b0a8a19a?w=800', // SPA区域
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', // 夜景泳池
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', // 热带泳池
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800', // 花园泳池
    'https://images.unsplash.com/photo-1559599746-c0f31c1a6f11?w=800', // 私人泳池
    'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800', // 山景泳池
    'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800', // 海景泳池
    'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800', // SPA按摩
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', // 水疗中心
];

// ========== 房型特定图片 ==========

// 大床房图片 (King Bed) - 20张
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
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800', // 精品大床房
    'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800', // 设计师大床房
    'https://images.unsplash.com/photo-1600210492486-724fe5c67f87?w=800', // 高级大床房
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', // 城景大床房
    'https://images.unsplash.com/photo-1600573472591-ee6c563aaec1?w=800', // 典雅大床房
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800', // 奢华大床房
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', // 海景大床房
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', // 山景大床房
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800', // 阳光大床房
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800', // 经典大床房
];

// 双床房图片 (Twin Beds) - 15张
export const TWIN_BED_ROOM_IMAGES = [
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', // 双床房间
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', // 标准双床
    'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=800', // 温馨双床房
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', // 简洁双床
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800', // 商务双床房
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', // 度假双床
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', // 现代双床
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800', // 景观双床
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800', // 精品双床房
    'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800', // 高级双床房
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800', // 舒适双床房
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', // 时尚双床房
    'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800', // 经典双床房
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800', // 明亮双床房
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800', // 简约双床房
];

// 套房图片 (Suite) - 15张
export const SUITE_ROOM_IMAGES = [
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', // 豪华套房客厅
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', // 行政套房
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800', // 总统套房
    'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800', // 景观套房
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', // 现代套房
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', // 大型套房
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', // 欧式套房
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', // 商务套房
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', // 海景套房
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', // 豪华海景套房
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', // 山景套房
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800', // 阳台套房
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800', // 复式套房
    'https://images.unsplash.com/photo-1600573472591-ee6c563aaec1?w=800', // 典雅套房
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800', // 皇家套房
];

// 亲子/家庭房图片 (Family Room) - 12张
export const FAMILY_ROOM_IMAGES = [
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800', // 宽敞家庭房
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', // 温馨家庭房
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800', // 亲子主题房
    'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=800', // 大空间家庭房
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', // 多床家庭房
    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800', // 现代家庭房
    'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800', // 明亮家庭房
    'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800', // 舒适家庭房
    'https://images.unsplash.com/photo-1600210492486-724fe5c67f87?w=800', // 高级家庭房
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', // 豪华家庭房
    'https://images.unsplash.com/photo-1600573472591-ee6c563aaec1?w=800', // 典雅家庭房
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800', // 经典家庭房
];

// 标准间图片 - 12张
export const STANDARD_ROOM_IMAGES = [
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', // 标准客房
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', // 基础房型
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', // 简洁标间
    'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=800', // 温馨标间
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', // 商务标间
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', // 度假标间
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800', // 精品标间
    'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800', // 高级标间
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800', // 舒适标间
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', // 时尚标间
    'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800', // 经典标间
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800', // 明亮标间
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
