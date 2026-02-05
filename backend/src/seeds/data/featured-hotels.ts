/**
 * 精选演示酒店数据
 * 包含真实、完整的酒店信息用于演示
 * 
 * 优化策略：
 * 1. 覆盖前端所有筛选项（热门筛选、酒店特色、客房特色、设施服务、品牌）
 * 2. 确保每张图片都不一样（使用图片生成函数）
 * 3. 确保数据分布合理（每个城市、星级、价格区间都有代表）
 */
import { SeedHotel } from '../config/types';
import {
    generateHotelImages,
    getRoomImageByType,
} from '../images/hotel-images';

/**
 * 精选演示酒店（20家）
 * 覆盖不同城市、星级、价格区间和设施标签
 * 确保对齐前端所有筛选项
 */
export const FEATURED_HOTELS: SeedHotel[] = [
    // ========== 五星豪华酒店 ==========
    {
        nameCn: '北京希尔顿酒店',
        nameEn: 'Beijing Hilton Hotel',
        address: '北京市朝阳区东三环北路8号',
        starRating: 5,
        openingDate: '2015-06-01',
        description: '北京希尔顿酒店位于繁华的朝阳区，毗邻使馆区，交通便利，设施完善。',
        facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', 'SPA', '24小时前台', '豪华', '管家服务'],
        nearbyAttractions: ['三里屯', '蓝色港湾', '朝阳公园'],
        transportation: ['地铁10号线亮马桥站步行5分钟', '距首都机场30分钟车程'],
        status: 'approved',
        roomTypes: [
            { 
                name: '豪华大床房', 
                price: 899, 
                originalPrice: 1099, 
                maxGuests: 2, 
                bedType: '1.8m大床', 
                roomSize: 40,
                imageUrl: getRoomImageByType('豪华大床房', 1, 0, 0),
            },
            { 
                name: '行政套房', 
                price: 1599, 
                originalPrice: 1999, 
                maxGuests: 3, 
                bedType: '1.8m大床+沙发床', 
                roomSize: 65,
                imageUrl: getRoomImageByType('行政套房', 1, 1, 0),
            },
        ],
        images: generateHotelImages(1, 0, 3), // 北京=0, 使用唯一ID确保图片不同
    },
    {
        nameCn: '上海外滩华尔道夫酒店',
        nameEn: 'Waldorf Astoria Shanghai on the Bund',
        address: '上海市黄浦区中山东一路2号',
        starRating: 5,
        openingDate: '2011-04-01',
        description: '百年外滩万国建筑群中的传奇酒店，尽享浦江两岸壮丽美景。',
        facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '西餐厅', 'SPA', '豪华', '管家服务', '含早餐'],
        nearbyAttractions: ['外滩', '南京路', '豫园'],
        transportation: ['地铁2号线南京东路站步行5分钟', '距浦东机场45分钟车程'],
        status: 'approved',
        roomTypes: [
            { 
                name: '豪华江景房', 
                price: 2888, 
                originalPrice: 3588, 
                maxGuests: 2, 
                bedType: '2m大床', 
                roomSize: 55,
                imageUrl: getRoomImageByType('豪华大床房', 2, 0, 1),
            },
            { 
                name: '总统套房', 
                price: 8888, 
                originalPrice: 9999, 
                maxGuests: 4, 
                bedType: '2m大床', 
                roomSize: 150,
                imageUrl: getRoomImageByType('总统套房', 2, 1, 1),
            },
        ],
        images: generateHotelImages(2, 1, 4), // 上海=1
    },

    // ========== 亲子主题酒店 ==========
    {
        nameCn: '上海迪士尼乐园酒店',
        nameEn: 'Shanghai Disneyland Hotel',
        address: '上海市浦东新区川沙镇迪士尼度假区',
        starRating: 5,
        openingDate: '2016-06-01',
        description: '迪士尼园区官方酒店，儿童乐园设施齐全，动画主题客房深受小朋友喜爱。',
        facilities: ['免费WiFi', '亲子', '儿童乐园', '儿童泳池', '游泳池', '含早餐', '免费停车场'],
        nearbyAttractions: ['迪士尼乐园', '迪士尼小镇'],
        transportation: ['地铁11号线迪士尼站', '距浦东机场约30分钟'],
        status: 'approved',
        roomTypes: [
            { 
                name: '米奇主题房', 
                price: 1288, 
                originalPrice: 1588, 
                maxGuests: 4, 
                bedType: '1.8m大床+儿童床', 
                roomSize: 48,
                imageUrl: getRoomImageByType('亲子主题房', 3, 0, 1),
            },
            { 
                name: '公主城堡套房', 
                price: 2588, 
                originalPrice: 2988, 
                maxGuests: 4, 
                bedType: '2m大床+儿童床', 
                roomSize: 75,
                imageUrl: getRoomImageByType('亲子主题房', 3, 1, 1),
            },
        ],
        images: generateHotelImages(3, 1, 3), // 上海=1
    },
    {
        nameCn: '广州长隆熊猫酒店',
        nameEn: 'Chimelong Panda Hotel',
        address: '广州市番禺区汉溪大道东299号',
        starRating: 5,
        openingDate: '2019-03-15',
        description: '紧邻长隆野生动物世界，熊猫主题设计，亲子游首选。',
        facilities: ['免费WiFi', '亲子', '儿童俱乐部', '游泳池', '含早餐', '免费停车场', '健身房'],
        nearbyAttractions: ['长隆野生动物世界', '长隆欢乐世界', '长隆水上乐园'],
        transportation: ['地铁3号线汉溪长隆站', '距白云机场约40分钟'],
        status: 'approved',
        roomTypes: [
            { 
                name: '熊猫家庭房', 
                price: 988, 
                originalPrice: 1288, 
                maxGuests: 4, 
                bedType: '1.8m大床+儿童床', 
                roomSize: 45,
                imageUrl: getRoomImageByType('家庭房', 4, 0, 2),
            },
            { 
                name: '白虎亲子套房', 
                price: 1388, 
                originalPrice: 1688, 
                maxGuests: 5, 
                bedType: '2m大床+双层儿童床', 
                roomSize: 65,
                imageUrl: getRoomImageByType('亲子主题房', 4, 1, 2),
            },
        ],
        images: generateHotelImages(4, 2, 3), // 广州=2
    },

    // ========== 含早餐酒店 ==========
    {
        nameCn: '西安大唐芙蓉园精品酒店',
        nameEn: 'Tang Dynasty Furong Garden Boutique Hotel',
        address: '西安市曲江新区芙蓉西路99号',
        starRating: 4,
        openingDate: '2016-10-01',
        description: '大唐芙蓉园旁，含丰盛自助早餐，唐风建筑尽显盛世气象。',
        facilities: ['免费WiFi', '含早餐', '中餐厅', '茶室', '免费停车场'],
        nearbyAttractions: ['大唐芙蓉园', '大雁塔', '曲江池'],
        transportation: ['地铁4号线大雁塔站', '距咸阳机场约50分钟'],
        status: 'approved',
        roomTypes: [
            { 
                name: '唐风大床房', 
                price: 498, 
                originalPrice: 598, 
                maxGuests: 2, 
                bedType: '1.8m大床', 
                roomSize: 35,
                imageUrl: getRoomImageByType('大床房', 5, 0, 3),
            },
            { 
                name: '唐风套房', 
                price: 888, 
                originalPrice: 1088, 
                maxGuests: 3, 
                bedType: '2m大床+客厅', 
                roomSize: 60,
                imageUrl: getRoomImageByType('商务套房', 5, 1, 3),
            },
        ],
        images: generateHotelImages(5, 3, 3), // 西安=3
    },

    // ========== 免费停车场酒店 ==========
    {
        nameCn: '杭州西溪悦榕庄',
        nameEn: 'Banyan Tree Hangzhou',
        address: '杭州市西湖区紫金港路21号',
        starRating: 5,
        openingDate: '2010-05-01',
        description: '西溪湿地旁独栋别墅式客房，超大免费停车场，自驾游首选。',
        facilities: ['免费WiFi', '免费停车场', 'SPA', '游泳池', '健身房', '中餐厅', '管家服务', '豪华'],
        nearbyAttractions: ['西溪湿地', '西湖', '灵隐寺'],
        transportation: ['自驾便捷', '距萧山机场约50分钟'],
        status: 'approved',
        roomTypes: [
            { 
                name: '园景别墅', 
                price: 2688, 
                originalPrice: 3288, 
                maxGuests: 2, 
                bedType: '2m大床', 
                roomSize: 90,
                imageUrl: getRoomImageByType('行政套房', 6, 0, 4),
            },
            { 
                name: '湖景别墅', 
                price: 3888, 
                originalPrice: 4688, 
                maxGuests: 3, 
                bedType: '2m大床', 
                roomSize: 120,
                imageUrl: getRoomImageByType('总统套房', 6, 1, 4),
            },
        ],
        images: generateHotelImages(6, 4, 4), // 杭州=4
    },

    // ========== 健身房酒店 ==========
    {
        nameCn: '北京CBD威斯汀酒店',
        nameEn: 'The Westin Beijing Chaoyang',
        address: '北京市朝阳区建国路7号',
        starRating: 5,
        openingDate: '2008-01-01',
        description: 'CBD核心位置，配备天梦之床和WestinWORKOUT健身房，商务健身两不误。',
        facilities: ['免费WiFi', '健身房', '24小时健身', '游泳池', '中餐厅', '西餐厅', 'SPA'],
        nearbyAttractions: ['国贸', 'CBD', '中央电视台'],
        transportation: ['地铁1号线国贸站', '距首都机场约40分钟'],
        status: 'approved',
        roomTypes: [
            { 
                name: '豪华大床房', 
                price: 988, 
                originalPrice: 1288, 
                maxGuests: 2, 
                bedType: '2m大床', 
                roomSize: 42,
                imageUrl: getRoomImageByType('豪华大床房', 7, 0, 0),
            },
            { 
                name: '行政套房', 
                price: 1888, 
                originalPrice: 2288, 
                maxGuests: 3, 
                bedType: '2m大床+客厅', 
                roomSize: 75,
                imageUrl: getRoomImageByType('行政套房', 7, 1, 0),
            },
        ],
        images: generateHotelImages(7, 0, 3), // 北京=0
    },

    // ========== 经济型酒店（低价位覆盖） ==========
    {
        nameCn: '上海全季酒店（外滩店）',
        nameEn: 'JI Hotel Shanghai Bund',
        address: '上海市黄浦区福州路318号',
        starRating: 3,
        openingDate: '2018-05-01',
        description: '外滩商圈高性价比选择，简约舒适，步行可达南京路。',
        facilities: ['免费WiFi', '24小时前台', '健身房', '近地铁'],
        nearbyAttractions: ['外滩', '南京路', '人民广场'],
        transportation: ['地铁2号线南京东路站步行3分钟', '距虹桥机场约40分钟'],
        status: 'approved',
        roomTypes: [
            { 
                name: '标准间', 
                price: 298, 
                originalPrice: 398, 
                maxGuests: 2, 
                bedType: '1.5m双床', 
                roomSize: 22,
                imageUrl: getRoomImageByType('标准间', 8, 0, 1),
            },
            { 
                name: '大床房', 
                price: 328, 
                originalPrice: 428, 
                maxGuests: 2, 
                bedType: '1.8m大床', 
                roomSize: 25,
                imageUrl: getRoomImageByType('大床房', 8, 1, 1),
            },
        ],
        images: generateHotelImages(8, 1, 2), // 上海=1
    },
    {
        nameCn: '成都亚朵酒店（春熙路店）',
        nameEn: 'Atour Hotel Chengdu Chunxi Road',
        address: '成都市锦江区春熙路南段68号',
        starRating: 4,
        openingDate: '2017-08-01',
        description: '春熙路核心地段，阅读主题设计，含自助早餐。',
        facilities: ['免费WiFi', '含早餐', '24小时前台', '阅读空间'],
        nearbyAttractions: ['春熙路', '太古里', '天府广场'],
        transportation: ['地铁2号线春熙路站', '距双流机场约40分钟'],
        status: 'approved',
        roomTypes: [
            { 
                name: '大床房', 
                price: 388, 
                originalPrice: 488, 
                maxGuests: 2, 
                bedType: '1.8m大床', 
                roomSize: 28,
                imageUrl: getRoomImageByType('大床房', 9, 0, 5),
            },
            { 
                name: '双床房', 
                price: 418, 
                originalPrice: 518, 
                maxGuests: 2, 
                bedType: '1.5m双床', 
                roomSize: 30,
                imageUrl: getRoomImageByType('双床房', 9, 1, 5),
            },
        ],
        images: generateHotelImages(9, 5, 3), // 成都=5
    },

    // ========== 度假村酒店 ==========
    {
        nameCn: '三亚亚龙湾瑞吉度假酒店',
        nameEn: 'The St. Regis Sanya Yalong Bay Resort',
        address: '三亚市亚龙湾国家旅游度假区',
        starRating: 5,
        openingDate: '2011-12-01',
        description: '亚龙湾一线海景，私人沙滩，无边泳池俯瞰南海。',
        facilities: ['免费WiFi', '游泳池', '无边泳池', '私人沙滩', 'SPA', '中餐厅', '西餐厅', '豪华', '管家服务', '免费停车场'],
        nearbyAttractions: ['亚龙湾', '热带天堂森林公园', '蜈支洲岛'],
        transportation: ['距凤凰机场约30分钟', '酒店提供接送'],
        status: 'approved',
        roomTypes: [
            { 
                name: '海景豪华房', 
                price: 1888, 
                originalPrice: 2288, 
                maxGuests: 2, 
                bedType: '2m大床', 
                roomSize: 58,
                imageUrl: getRoomImageByType('豪华大床房', 10, 0, 14),
            },
            { 
                name: '海景套房', 
                price: 3888, 
                originalPrice: 4688, 
                maxGuests: 4, 
                bedType: '2m大床+客厅', 
                roomSize: 95,
                imageUrl: getRoomImageByType('行政套房', 10, 1, 14),
            },
        ],
        images: generateHotelImages(10, 14, 4), // 三亚=14
    },
];

export default FEATURED_HOTELS;
