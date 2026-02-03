/**
 * 种子数据常量定义
 * 统一管理城市、设施、房型等配置
 */

// ========== 城市配置 ==========

/** 主要城市列表（按区域分组） */
export const CITIES = {
    // 一线城市
    tier1: ['北京', '上海', '广州', '深圳'],
    // 新一线城市
    newTier1: ['杭州', '成都', '重庆', '西安', '苏州', '南京', '武汉', '长沙'],
    // 旅游热门城市
    tourist: ['三亚', '厦门', '青岛', '大连', '桂林', '丽江', '昆明', '哈尔滨'],
    // 其他省会
    capital: ['天津', '沈阳', '济南', '郑州', '合肥', '福州', '南昌', '贵阳', '南宁', '无锡'],
};

/** 所有城市扁平化列表 */
export const ALL_CITIES = [
    ...CITIES.tier1,
    ...CITIES.newTier1,
    ...CITIES.tourist,
    ...CITIES.capital,
];

// ========== 设施标签配置 ==========

/**
 * 设施标签分组
 * 每组的第一个标签为主标签，用于筛选匹配
 */
export const FACILITY_GROUPS = {
    /** 亲子设施 */
    family: {
        primary: '亲子',
        tags: ['亲子', '儿童乐园', '儿童泳池', '儿童俱乐部', '家庭房', '儿童餐'],
    },
    /** 豪华设施 */
    luxury: {
        primary: '豪华',
        tags: ['豪华', '管家服务', '米其林餐厅', '私人泳池', 'VIP服务', '行政酒廊'],
    },
    /** 停车设施 */
    parking: {
        primary: '免费停车场',
        tags: ['免费停车场', '停车场', '代客泊车', '地下停车场', '充电桩'],
    },
    /** 早餐设施 */
    breakfast: {
        primary: '含早餐',
        tags: ['含早餐', '自助早餐', '中西式早餐', '房内早餐'],
    },
    /** 健身设施 */
    fitness: {
        primary: '健身房',
        tags: ['健身房', '24小时健身', '私教服务', '瑜伽室', '跑步机'],
    },
    /** 泳池设施 */
    pool: {
        primary: '游泳池',
        tags: ['游泳池', '室内泳池', '室外泳池', '无边泳池', '恒温泳池'],
    },
    /** SPA设施 */
    spa: {
        primary: 'SPA',
        tags: ['SPA', '按摩', '美容护理', '桑拿', '温泉'],
    },
    /** 基础设施 */
    basic: {
        primary: '免费WiFi',
        tags: ['免费WiFi', '高速网络', '商务中心', '24小时前台'],
    },
    /** 餐饮设施 */
    dining: {
        primary: '中餐厅',
        tags: ['中餐厅', '西餐厅', '自助餐厅', '酒吧', '咖啡厅', '日料'],
    },
    /** 会议设施 */
    meeting: {
        primary: '会议室',
        tags: ['会议室', '宴会厅', '多功能厅', '商务中心'],
    },
};

/** 筛选用的主标签列表 */
export const FILTER_TAGS = [
    '亲子',
    '豪华',
    '免费停车场',
    '含早餐',
    '健身房',
];

// ========== 房型配置 ==========

/** 房型基础配置 */
export const ROOM_TYPE_CONFIGS = [
    { name: '标准间', priceBase: 200, sizeMin: 25, sizeMax: 30, bedType: '1.5m双床', maxGuests: 2 },
    { name: '大床房', priceBase: 280, sizeMin: 28, sizeMax: 35, bedType: '1.8m大床', maxGuests: 2 },
    { name: '双床房', priceBase: 280, sizeMin: 28, sizeMax: 35, bedType: '1.5m双床', maxGuests: 2 },
    { name: '豪华大床房', priceBase: 400, sizeMin: 35, sizeMax: 45, bedType: '1.8m大床', maxGuests: 2 },
    { name: '商务套房', priceBase: 600, sizeMin: 50, sizeMax: 70, bedType: '2m大床+客厅', maxGuests: 3 },
    { name: '行政套房', priceBase: 800, sizeMin: 60, sizeMax: 85, bedType: '2m大床+客厅', maxGuests: 3 },
    { name: '总统套房', priceBase: 2000, sizeMin: 100, sizeMax: 200, bedType: '2.2m大床+客厅', maxGuests: 4 },
    { name: '家庭房', priceBase: 500, sizeMin: 45, sizeMax: 60, bedType: '1.8m大床+儿童床', maxGuests: 4 },
    { name: '亲子主题房', priceBase: 600, sizeMin: 40, sizeMax: 55, bedType: '1.8m大床+儿童床', maxGuests: 4 },
];

/** 床型列表 */
export const BED_TYPES = [
    '1.5m大床',
    '1.8m大床',
    '2m大床',
    '2.2m大床',
    '1.2m双床',
    '1.5m双床',
];

// ========== 价格区间配置 ==========

/** 价格区间定义（用于测试覆盖） */
export const PRICE_RANGES = [
    { min: 0, max: 300, label: '300元以下' },
    { min: 300, max: 500, label: '300-500元' },
    { min: 500, max: 800, label: '500-800元' },
    { min: 800, max: 1500, label: '800-1500元' },
    { min: 1500, max: 3000, label: '1500-3000元' },
    { min: 3000, max: Infinity, label: '3000元以上' },
];

// ========== 酒店品牌配置 ==========

/** 酒店品牌前缀 */
export const HOTEL_BRANDS = {
    /** 奢华品牌 (5星) */
    luxury: ['瑞吉', '丽思卡尔顿', '柏悦', '华尔道夫', '文华东方', '安缦', '悦榕庄', '璞丽', '半岛', '瑰丽'],
    /** 高端品牌 (4-5星) */
    upscale: ['香格里拉', '万豪', '希尔顿', '凯悦', '洲际', '四季', '威斯汀', '喜来登', '君悦', '艾美'],
    /** 中高端品牌 (3-4星) */
    midUpscale: ['皇冠假日', '假日', '凯宾斯基', '索菲特', '康莱德', '华邑', '英迪格'],
    /** 经济品牌 (2-3星) */
    economy: ['智选假日', '汉庭', '如家', '全季', '亚朵', '桔子', '维也纳'],
};

/** 酒店后缀 */
export const HOTEL_SUFFIXES = ['大酒店', '酒店', '度假村', '精品酒店', '商务酒店', '公寓酒店'];

// ========== 街道名配置 ==========

export const STREET_NAMES = [
    '中山路', '人民路', '解放路', '建设路', '和平路', '长江路', '黄河路',
    '南京路', '淮海路', '延安路', '复兴路', '世纪大道', '金融街', '商业街',
    '文化路', '科技路', '创新路', '繁华路', '滨江路', '湖滨路',
];
