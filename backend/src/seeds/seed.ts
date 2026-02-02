import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import path from 'path';
import dotenv from 'dotenv';

const backendRoot = path.resolve(__dirname, '../..');
// 与 ConfigModule 的 envFilePath 顺序一致：.env.local 优先生效
dotenv.config({ path: path.resolve(backendRoot, '.env.local') });
dotenv.config({ path: path.resolve(backendRoot, '.env') });

const resolveSqliteDatabasePath = (db: string): string => {
  if (db === ':memory:' || db.startsWith('file:')) return db;
  if (path.isAbsolute(db)) return db;
  return path.resolve(backendRoot, db);
};

// 预设的测试用户数据
const seedUsers = [
  {
    username: 'merchant01',
    password: 'Test123456',
    role: 'merchant',
    nickname: '测试商户',
    phone: '13800138001',
  },
  {
    username: 'merchant02',
    password: 'Test123456',
    role: 'merchant',
    nickname: '演示商户',
    phone: '13800138002',
  },
  {
    username: 'admin01',
    password: 'Admin123456',
    role: 'admin',
    nickname: '系统管理员',
    phone: '13900139001',
  },
];

// 预设的酒店数据（用于演示）
const seedHotels = [
  {
    nameCn: '北京希尔顿酒店',
    nameEn: 'Beijing Hilton Hotel',
    address: '北京市朝阳区东三环北路8号',
    starRating: 5,
    openingDate: '2015-06-01',
    description: '北京希尔顿酒店位于繁华的朝阳区，毗邻使馆区，交通便利，设施完善。',
    facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', 'SPA', '24小时前台'],
    nearbyAttractions: ['三里屯', '蓝色港湾', '朝阳公园'],
    transportation: ['地铁10号线亮马桥站步行5分钟', '距首都机场30分钟车程'],
    status: 'approved',
    roomTypes: [
      { name: '豪华大床房', price: 899, originalPrice: 1099, maxGuests: 2, bedType: '1.8m大床', roomSize: 40 },
      { name: '行政套房', price: 1599, originalPrice: 1999, maxGuests: 3, bedType: '1.8m大床+沙发床', roomSize: 65 },
    ],
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description: '酒店外观' },
      { imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', description: '豪华客房' },
    ],
  },
  {
    nameCn: '上海外滩丽思卡尔顿酒店',
    nameEn: 'The Ritz-Carlton Shanghai Pudong',
    address: '上海市浦东新区陆家嘴世纪大道8号',
    starRating: 5,
    openingDate: '2010-03-15',
    description: '坐落于上海浦东陆家嘴金融区，俯瞰黄浦江和外滩天际线，是商务和休闲的理想之选。',
    facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', '酒吧', 'SPA', '会议室'],
    nearbyAttractions: ['东方明珠', '上海环球金融中心', '外滩'],
    transportation: ['地铁2号线陆家嘴站步行3分钟', '距浦东机场40分钟车程'],
    status: 'approved',
    roomTypes: [
      { name: '豪华江景房', price: 1299, originalPrice: 1599, maxGuests: 2, bedType: '2m大床', roomSize: 50 },
      { name: '总统套房', price: 8888, originalPrice: 9999, maxGuests: 4, bedType: '2m大床', roomSize: 150 },
    ],
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', description: '酒店大堂' },
    ],
  },
  {
    nameCn: '广州四季酒店',
    nameEn: 'Four Seasons Hotel Guangzhou',
    address: '广州市天河区珠江新城珠江西路5号',
    starRating: 5,
    openingDate: '2012-09-01',
    description: '坐落于珠江新城核心，毗邻广州塔，尽览珠江夜景，奢华与便利兼具。',
    facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '西餐厅', 'SPA', '行政酒廊', '停车场'],
    nearbyAttractions: ['广州塔', '珠江新城', '花城广场', '广东省博物馆'],
    transportation: ['地铁3号线珠江新城站步行约8分钟', '距白云机场约40分钟'],
    status: 'approved',
    roomTypes: [
      { name: '豪华江景房', price: 1288, originalPrice: 1588, maxGuests: 2, bedType: '2m大床', roomSize: 48 },
      { name: '行政江景套房', price: 2188, originalPrice: 2688, maxGuests: 3, bedType: '2m大床+客厅', roomSize: 78 },
      { name: '四季套房', price: 3588, originalPrice: 4188, maxGuests: 4, bedType: '2m大床', roomSize: 120 },
    ],
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description: '外景' },
      { imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', description: '客房' },
    ],
  },
  {
    nameCn: '深圳福田香格里拉大酒店',
    nameEn: 'Shangri-La Hotel Shenzhen',
    address: '深圳市福田区益田路4088号',
    starRating: 5,
    openingDate: '2009-05-01',
    description: '位于福田中心区，紧邻会展中心与购物公园，商务出行与休闲皆宜。',
    facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '酒吧', 'SPA', '会议室', '免费停车场'],
    nearbyAttractions: ['深圳会展中心', '购物公园', '莲花山公园', '市民中心'],
    transportation: ['地铁1号线购物公园站B出口', '距宝安机场约30分钟'],
    status: 'approved',
    roomTypes: [
      { name: '豪华大床房', price: 688, originalPrice: 888, maxGuests: 2, bedType: '1.8m大床', roomSize: 38 },
      { name: '行政豪华房', price: 988, originalPrice: 1288, maxGuests: 2, bedType: '2m大床', roomSize: 45 },
      { name: '香格里拉套房', price: 1888, originalPrice: 2288, maxGuests: 3, bedType: '2m大床+客厅', roomSize: 80 },
    ],
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', description: '大堂' },
    ],
  },
  {
    nameCn: '杭州西湖国宾馆',
    nameEn: 'Hangzhou Xihu State Guest House',
    address: '杭州市西湖区杨公堤18号',
    starRating: 5,
    openingDate: '1958-01-01',
    description: '坐拥西湖绝佳位置，园林式建筑，曾接待众多元首，闹中取静。',
    facilities: ['免费WiFi', '中餐厅', '茶室', '园林', '会议室', '停车场'],
    nearbyAttractions: ['西湖', '雷峰塔', '苏堤', '花港观鱼'],
    transportation: ['公交西湖外线可达', '距萧山机场约50分钟'],
    status: 'approved',
    roomTypes: [
      { name: '园景标准间', price: 1688, originalPrice: 1988, maxGuests: 2, bedType: '1.8m双床', roomSize: 42 },
      { name: '湖景大床房', price: 2288, originalPrice: 2688, maxGuests: 2, bedType: '2m大床', roomSize: 55 },
      { name: '西湖套房', price: 3888, originalPrice: 4588, maxGuests: 4, bedType: '2m大床+客厅', roomSize: 95 },
    ],
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800', description: '园林' },
    ],
  },
  {
    nameCn: '成都香格里拉大酒店',
    nameEn: 'Shangri-La Hotel Chengdu',
    address: '成都市锦江区滨江东路9号',
    starRating: 5,
    openingDate: '2007-04-01',
    description: '毗邻合江亭与九眼桥，俯瞰锦江，体验成都慢生活与美食。',
    facilities: ['免费WiFi', '游泳池', '健身房', '川菜餐厅', '酒吧', 'SPA', '会议室', '停车场'],
    nearbyAttractions: ['合江亭', '九眼桥', '春熙路', '太古里'],
    transportation: ['地铁2号线东门大桥站', '距双流机场约25分钟'],
    status: 'approved',
    roomTypes: [
      { name: '豪华城景房', price: 588, originalPrice: 728, maxGuests: 2, bedType: '1.8m大床', roomSize: 36 },
      { name: '豪华江景房', price: 688, originalPrice: 858, maxGuests: 2, bedType: '1.8m大床', roomSize: 38 },
      { name: '行政套房', price: 1288, originalPrice: 1588, maxGuests: 3, bedType: '2m大床+客厅', roomSize: 72 },
    ],
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description: '外观' },
    ],
  },
  {
    nameCn: '西安大雁塔假日酒店',
    nameEn: "Holiday Inn Xi'an Big Wild Goose Pagoda",
    address: '西安市雁塔区雁塔南路与雁南一路交汇处',
    starRating: 4,
    openingDate: '2014-06-01',
    description: '紧邻大雁塔北广场，步行可达大唐不夜城，适合游览古城与夜游。',
    facilities: ['免费WiFi', '健身房', '餐厅', '会议室', '停车场', '24小时前台'],
    nearbyAttractions: ['大雁塔', '大唐不夜城', '陕西历史博物馆', '大唐芙蓉园'],
    transportation: ['地铁3号线大雁塔站', '距咸阳机场约50分钟'],
    status: 'approved',
    roomTypes: [
      { name: '标准双床房', price: 398, originalPrice: 498, maxGuests: 2, bedType: '1.2m双床', roomSize: 28 },
      { name: '豪华大床房', price: 468, originalPrice: 568, maxGuests: 2, bedType: '1.8m大床', roomSize: 32 },
      { name: '家庭房', price: 598, originalPrice: 698, maxGuests: 4, bedType: '1.8m大床+1.2m床', roomSize: 38 },
    ],
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description: '酒店' },
    ],
  },
  {
    nameCn: '青岛海景大酒店',
    nameEn: 'Qingdao Seaview Hotel',
    address: '青岛市市南区香港中路76号',
    starRating: 4,
    openingDate: '2011-08-01',
    description: '面朝栈桥与大海，步行可达五四广场，尽享海滨风情。',
    facilities: ['免费WiFi', '海景餐厅', '健身房', '会议室', '停车场', '洗衣服务'],
    nearbyAttractions: ['栈桥', '五四广场', '奥帆中心', '八大关'],
    transportation: ['地铁2号线五四广场站', '距流亭机场约40分钟'],
    status: 'approved',
    roomTypes: [
      { name: '城景标准间', price: 428, originalPrice: 528, maxGuests: 2, bedType: '1.2m双床', roomSize: 30 },
      { name: '海景大床房', price: 688, originalPrice: 828, maxGuests: 2, bedType: '1.8m大床', roomSize: 38 },
      { name: '海景套房', price: 1088, originalPrice: 1288, maxGuests: 3, bedType: '1.8m大床+客厅', roomSize: 65 },
    ],
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', description: '海景' },
    ],
  },
  {
    nameCn: '南京金陵饭店',
    nameEn: 'Jinling Hotel Nanjing',
    address: '南京市鼓楼区汉中路2号',
    starRating: 5,
    openingDate: '1983-10-01',
    description: '南京地标酒店，位于新街口核心，曾为国内第一高楼，承载城市记忆。',
    facilities: ['免费WiFi', '中餐厅', '西餐厅', '健身房', '游泳池', '会议室', '停车场'],
    nearbyAttractions: ['新街口', '夫子庙', '玄武湖', '中山陵'],
    transportation: ['地铁1/2号线新街口站', '距禄口机场约45分钟'],
    status: 'approved',
    roomTypes: [
      { name: '高级大床房', price: 588, originalPrice: 688, maxGuests: 2, bedType: '1.8m大床', roomSize: 35 },
      { name: '豪华行政房', price: 788, originalPrice: 928, maxGuests: 2, bedType: '2m大床', roomSize: 42 },
      { name: '金陵套房', price: 1588, originalPrice: 1888, maxGuests: 4, bedType: '2m大床+客厅', roomSize: 88 },
    ],
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', description: '客房' },
    ],
  },
  {
    nameCn: '厦门鼓浪屿海景客栈',
    nameEn: 'Xiamen Gulangyu Seaview Inn',
    address: '厦门市思明区鼓浪屿龙头路100号',
    starRating: 3,
    openingDate: '2016-03-01',
    description: '鼓浪屿岛上精品客栈，闹中取静，推窗见海，感受文艺与悠闲。',
    facilities: ['免费WiFi', '早餐', '茶室', '露台', '行李寄存'],
    nearbyAttractions: ['日光岩', '菽庄花园', '皓月园', '龙头路商业街'],
    transportation: ['轮渡至鼓浪屿码头后步行', '距高崎机场约30分钟'],
    status: 'approved',
    roomTypes: [
      { name: '标准大床房', price: 328, originalPrice: 398, maxGuests: 2, bedType: '1.8m大床', roomSize: 22 },
      { name: '海景大床房', price: 488, originalPrice: 588, maxGuests: 2, bedType: '1.8m大床', roomSize: 28 },
      { name: '家庭复式房', price: 688, originalPrice: 798, maxGuests: 4, bedType: '1.8m大床+阁楼', roomSize: 42 },
    ],
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800', description: '露台' },
    ],
  },
  {
    nameCn: '三亚亚龙湾万豪度假酒店',
    nameEn: 'Marriott Resort & Spa Sanya Yalong Bay',
    address: '海南省三亚市吉阳区亚龙湾国家旅游度假区',
    starRating: 5,
    openingDate: '2005-12-01',
    description: '亚龙湾一线海景，私属沙滩，亲子与度假设施齐全，热带风情十足。',
    facilities: ['免费WiFi', '私人沙滩', '游泳池', '儿童俱乐部', 'SPA', '多国餐厅', '停车场'],
    nearbyAttractions: ['亚龙湾沙滩', '热带天堂森林公园', '百花谷商业街'],
    transportation: ['酒店班车至机场/市区', '距凤凰机场约35分钟'],
    status: 'approved',
    roomTypes: [
      { name: '园景房', price: 988, originalPrice: 1188, maxGuests: 2, bedType: '1.8m大床', roomSize: 48 },
      { name: '海景房', price: 1288, originalPrice: 1588, maxGuests: 2, bedType: '1.8m大床', roomSize: 48 },
      { name: '海景套房', price: 2288, originalPrice: 2688, maxGuests: 4, bedType: '2m大床+客厅', roomSize: 95 },
    ],
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', description: '海景' },
      { imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description: '泳池' },
    ],
  },
  // ========== 以下为大量扩充数据 ==========
  { nameCn: '武汉光谷凯悦酒店', nameEn: 'Hyatt Regency Wuhan Optics Valley', address: '武汉市洪山区珞喻路1077号', starRating: 5, openingDate: '2016-05-01', description: '位于光谷核心，毗邻华中科技大学，商务与会议设施完善。', facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '会议室', '停车场'], nearbyAttractions: ['光谷广场', '华中科技大学', '东湖'], transportation: ['地铁2号线光谷广场站', '距天河机场约50分钟'], status: 'approved', roomTypes: [{ name: '豪华大床房', price: 588, originalPrice: 688, maxGuests: 2, bedType: '1.8m大床', roomSize: 38 }, { name: '行政房', price: 788, originalPrice: 928, maxGuests: 2, bedType: '2m大床', roomSize: 42 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description: '外观' }] },
  { nameCn: '长沙君悦酒店', nameEn: 'Grand Hyatt Changsha', address: '长沙市芙蓉区解放西路188号', starRating: 5, openingDate: '2017-08-01', description: '坐落于五一商圈，俯瞰湘江，购物与美食触手可及。', facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '酒吧', 'SPA', '停车场'], nearbyAttractions: ['五一广场', '橘子洲', '岳麓山'], transportation: ['地铁1/2号线五一广场站', '距黄花机场约30分钟'], status: 'approved', roomTypes: [{ name: '城景房', price: 688, originalPrice: 828, maxGuests: 2, bedType: '1.8m大床', roomSize: 40 }, { name: '江景房', price: 888, originalPrice: 1088, maxGuests: 2, bedType: '2m大床', roomSize: 45 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', description: '客房' }] },
  { nameCn: '重庆解放碑威斯汀酒店', nameEn: 'The Westin Chongqing Liberation Square', address: '重庆市渝中区民权路66号', starRating: 5, openingDate: '2012-06-01', description: '解放碑核心地标，步行可达洪崖洞、长江索道。', facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '行政酒廊', '停车场'], nearbyAttractions: ['解放碑', '洪崖洞', '长江索道'], transportation: ['地铁1/2号线较场口站', '距江北机场约30分钟'], status: 'approved', roomTypes: [{ name: '豪华房', price: 658, originalPrice: 798, maxGuests: 2, bedType: '1.8m大床', roomSize: 36 }, { name: '江景房', price: 798, originalPrice: 958, maxGuests: 2, bedType: '2m大床', roomSize: 40 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', description: '外景' }] },
  { nameCn: '苏州金鸡湖凯宾斯基大酒店', nameEn: 'Kempinski Hotel Suzhou', address: '苏州市工业园区国宾路1号', starRating: 5, openingDate: '2007-09-01', description: '金鸡湖畔，湖景与园林兼得，适合度假与会议。', facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '西餐厅', 'SPA', '停车场'], nearbyAttractions: ['金鸡湖', '苏州中心', '诚品书店'], transportation: ['地铁1号线东方之门站', '距苏南硕放机场约50分钟'], status: 'approved', roomTypes: [{ name: '园景房', price: 788, originalPrice: 928, maxGuests: 2, bedType: '1.8m大床', roomSize: 42 }, { name: '湖景房', price: 988, originalPrice: 1188, maxGuests: 2, bedType: '2m大床', roomSize: 48 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800', description: '湖景' }] },
  { nameCn: '无锡灵山君来波罗蜜多酒店', nameEn: 'Wuxi Lingshan Buluomiduo Hotel', address: '无锡市滨湖区马山环山西路68号', starRating: 5, openingDate: '2015-10-01', description: '灵山景区内，禅意与度假结合，推窗即景。', facilities: ['免费WiFi', '中餐厅', '茶室', '禅修', '停车场'], nearbyAttractions: ['灵山大佛', '拈花湾'], transportation: ['公交88/89路', '距苏南硕放机场约50分钟'], status: 'approved', roomTypes: [{ name: '禅意大床房', price: 888, originalPrice: 1088, maxGuests: 2, bedType: '1.8m大床', roomSize: 45 }, { name: '庭院套房', price: 1588, originalPrice: 1888, maxGuests: 4, bedType: '2m大床+庭院', roomSize: 80 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description: '庭院' }] },
  { nameCn: '大连香格里拉大酒店', nameEn: 'Shangri-La Hotel Dalian', address: '大连市中山区人民路66号', starRating: 5, openingDate: '1997-05-01', description: '人民路核心，毗邻中山广场，海风与繁华兼具。', facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '酒吧', '停车场'], nearbyAttractions: ['中山广场', '星海广场', '老虎滩'], transportation: ['地铁2号线中山广场站', '距周水子机场约20分钟'], status: 'approved', roomTypes: [{ name: '豪华房', price: 598, originalPrice: 728, maxGuests: 2, bedType: '1.8m大床', roomSize: 38 }, { name: '海景房', price: 758, originalPrice: 898, maxGuests: 2, bedType: '2m大床', roomSize: 42 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', description: '海景' }] },
  { nameCn: '沈阳香格里拉大酒店', nameEn: 'Shangri-La Hotel Shenyang', address: '沈阳市和平区中华路68号', starRating: 5, openingDate: '1999-08-01', description: '太原街商圈核心，购物与出行便利。', facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '会议室', '停车场'], nearbyAttractions: ['太原街', '沈阳故宫', '中街'], transportation: ['地铁1号线太原街站', '距桃仙机场约40分钟'], status: 'approved', roomTypes: [{ name: '豪华房', price: 528, originalPrice: 648, maxGuests: 2, bedType: '1.8m大床', roomSize: 36 }, { name: '行政房', price: 688, originalPrice: 828, maxGuests: 2, bedType: '2m大床', roomSize: 42 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', description: '客房' }] },
  { nameCn: '昆明翠湖宾馆', nameEn: 'Kunming Cuihu Hotel', address: '昆明市五华区翠湖南路6号', starRating: 5, openingDate: '1956-01-01', description: '翠湖畔老牌国宾馆，园林静谧，毗邻云南大学。', facilities: ['免费WiFi', '中餐厅', '茶室', '会议室', '停车场'], nearbyAttractions: ['翠湖', '云南大学', '陆军讲武堂'], transportation: ['公交至翠湖', '距长水机场约40分钟'], status: 'approved', roomTypes: [{ name: '园景房', price: 688, originalPrice: 828, maxGuests: 2, bedType: '1.8m大床', roomSize: 38 }, { name: '湖景房', price: 888, originalPrice: 1088, maxGuests: 2, bedType: '2m大床', roomSize: 45 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800', description: '园景' }] },
  { nameCn: '丽江古城英迪格酒店', nameEn: 'Hotel Indigo Lijiang Ancient Town', address: '丽江市古城区五一街文治巷80号', starRating: 5, openingDate: '2014-04-01', description: '古城内精品酒店，纳西院落与现代设计融合。', facilities: ['免费WiFi', '餐厅', '茶室', '露台', '行李寄存'], nearbyAttractions: ['四方街', '木府', '狮子山'], transportation: ['古城内步行', '距三义机场约30分钟'], status: 'approved', roomTypes: [{ name: '庭院房', price: 988, originalPrice: 1188, maxGuests: 2, bedType: '1.8m大床', roomSize: 35 }, { name: '雪山观景房', price: 1288, originalPrice: 1588, maxGuests: 2, bedType: '2m大床', roomSize: 42 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description: '庭院' }] },
  { nameCn: '哈尔滨香格里拉大酒店', nameEn: 'Shangri-La Hotel Harbin', address: '哈尔滨市道里区友谊路555号', starRating: 5, openingDate: '1999-12-01', description: '松花江畔，毗邻中央大街，冰雪季出行首选。', facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '酒吧', '停车场'], nearbyAttractions: ['中央大街', '圣索菲亚大教堂', '冰雪大世界'], transportation: ['地铁2号线中央大街站', '距太平机场约40分钟'], status: 'approved', roomTypes: [{ name: '豪华房', price: 558, originalPrice: 688, maxGuests: 2, bedType: '1.8m大床', roomSize: 36 }, { name: '江景房', price: 688, originalPrice: 828, maxGuests: 2, bedType: '2m大床', roomSize: 40 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', description: '外景' }] },
  { nameCn: '天津海河英迪格酒店', nameEn: 'Hotel Indigo Tianjin Haihe', address: '天津市河北区海河东路凤凰商贸广场', starRating: 5, openingDate: '2016-06-01', description: '海河畔，意式风情区旁，设计感十足。', facilities: ['免费WiFi', '餐厅', '酒吧', '健身房', '停车场'], nearbyAttractions: ['意式风情区', '古文化街', '天津眼'], transportation: ['地铁2号线建国道站', '距滨海机场约25分钟'], status: 'approved', roomTypes: [{ name: '河景房', price: 688, originalPrice: 828, maxGuests: 2, bedType: '1.8m大床', roomSize: 38 }, { name: '露台房', price: 888, originalPrice: 1088, maxGuests: 2, bedType: '2m大床', roomSize: 45 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', description: '河景' }] },
  { nameCn: '济南索菲特银座大饭店', nameEn: 'Sofitel Jinan Silver Plaza', address: '济南市历下区泺源大街66号', starRating: 5, openingDate: '2002-05-01', description: '泉城广场旁，趵突泉与大明湖咫尺之遥。', facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '会议室', '停车场'], nearbyAttractions: ['泉城广场', '趵突泉', '大明湖'], transportation: ['公交至泉城广场', '距遥墙机场约40分钟'], status: 'approved', roomTypes: [{ name: '豪华房', price: 528, originalPrice: 648, maxGuests: 2, bedType: '1.8m大床', roomSize: 35 }, { name: '行政房', price: 688, originalPrice: 828, maxGuests: 2, bedType: '2m大床', roomSize: 42 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description: '外观' }] },
  { nameCn: '合肥元一希尔顿酒店', nameEn: 'Hilton Hefei Yuan Yi', address: '合肥市蜀山区长江西路与潜山路交口', starRating: 5, openingDate: '2010-09-01', description: '政务区核心，商务与会议设施完善。', facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '会议室', '停车场'], nearbyAttractions: ['天鹅湖', '安徽博物院', '淮河路步行街'], transportation: ['地铁2号线三里庵站', '距新桥机场约40分钟'], status: 'approved', roomTypes: [{ name: '豪华大床房', price: 468, originalPrice: 568, maxGuests: 2, bedType: '1.8m大床', roomSize: 36 }, { name: '行政套房', price: 788, originalPrice: 948, maxGuests: 3, bedType: '2m大床+客厅', roomSize: 72 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', description: '客房' }] },
  { nameCn: '福州香格里拉大酒店', nameEn: 'Shangri-La Hotel Fuzhou', address: '福州市鼓楼区新权南路9号', starRating: 5, openingDate: '2005-06-01', description: '五一广场旁，三坊七巷与闽江夜景近在咫尺。', facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '酒吧', '停车场'], nearbyAttractions: ['三坊七巷', '五一广场', '闽江夜游'], transportation: ['地铁1号线南门兜站', '距长乐机场约50分钟'], status: 'approved', roomTypes: [{ name: '豪华房', price: 558, originalPrice: 688, maxGuests: 2, bedType: '1.8m大床', roomSize: 38 }, { name: '江景房', price: 688, originalPrice: 828, maxGuests: 2, bedType: '2m大床', roomSize: 42 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', description: '江景' }] },
  { nameCn: '郑州建国饭店', nameEn: 'Jianguo Hotel Zhengzhou', address: '郑州市金水区金水路115号', starRating: 5, openingDate: '1986-01-01', description: '金水路地标，毗邻郑州火车站与二七塔。', facilities: ['免费WiFi', '中餐厅', '西餐厅', '健身房', '会议室', '停车场'], nearbyAttractions: ['二七塔', '德化街', '河南博物院'], transportation: ['地铁1号线二七广场站', '距新郑机场约40分钟'], status: 'approved', roomTypes: [{ name: '标准房', price: 428, originalPrice: 528, maxGuests: 2, bedType: '1.8m大床', roomSize: 32 }, { name: '豪华房', price: 528, originalPrice: 648, maxGuests: 2, bedType: '2m大床', roomSize: 38 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description: '外观' }] },
  { nameCn: '南昌力高皇冠假日酒店', nameEn: 'Crowne Plaza Nanchang Riverside', address: '南昌市东湖区沿江中大道268号', starRating: 5, openingDate: '2012-04-01', description: '赣江畔，滕王阁与红谷滩对望。', facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '会议室', '停车场'], nearbyAttractions: ['滕王阁', '八一纪念馆', '红谷滩'], transportation: ['地铁1号线滕王阁站', '距昌北机场约30分钟'], status: 'approved', roomTypes: [{ name: '江景房', price: 488, originalPrice: 588, maxGuests: 2, bedType: '1.8m大床', roomSize: 36 }, { name: '行政江景房', price: 628, originalPrice: 768, maxGuests: 2, bedType: '2m大床', roomSize: 42 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', description: '江景' }] },
  { nameCn: '贵阳喜来登贵航酒店', nameEn: 'Sheraton Guiyang Hotel', address: '贵阳市云岩区中华北路282号', starRating: 5, openingDate: '2008-11-01', description: '市中心喷水池商圈，甲秀楼与黔灵山便利可达。', facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '会议室', '停车场'], nearbyAttractions: ['甲秀楼', '黔灵山', '青岩古镇'], transportation: ['公交至喷水池', '距龙洞堡机场约25分钟'], status: 'approved', roomTypes: [{ name: '豪华房', price: 468, originalPrice: 578, maxGuests: 2, bedType: '1.8m大床', roomSize: 35 }, { name: '行政房', price: 598, originalPrice: 728, maxGuests: 2, bedType: '2m大床', roomSize: 40 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description: '客房' }] },
  { nameCn: '南宁万达嘉华酒店', nameEn: 'Wanda Realm Nanning', address: '南宁市青秀区民族大道136号', starRating: 5, openingDate: '2014-09-01', description: '青秀区核心，万象城与东盟商务区毗邻。', facilities: ['免费WiFi', '游泳池', '健身房', '中餐厅', '会议室', '停车场'], nearbyAttractions: ['青秀山', '万象城', '南湖公园'], transportation: ['地铁1号线万象城站', '距吴圩机场约35分钟'], status: 'approved', roomTypes: [{ name: '豪华房', price: 488, originalPrice: 588, maxGuests: 2, bedType: '1.8m大床', roomSize: 38 }, { name: '行政房', price: 628, originalPrice: 768, maxGuests: 2, bedType: '2m大床', roomSize: 45 }], images: [{ imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', description: '外观' }] },
];

async function seed() {
  console.log('🌱 开始初始化种子数据...');

  // 根据环境变量判断数据库类型
  const useSqlite = process.env.DB_TYPE === 'sqlite' || (!process.env.DB_TYPE && !process.env.DB_HOST);
  const dbType = useSqlite ? 'sqlite' : 'postgres';
  
  let dataSourceOptions: any;
  
  if (dbType === 'sqlite') {
    dataSourceOptions = {
      type: 'better-sqlite3',
      database: resolveSqliteDatabasePath(process.env.DB_DATABASE || 'hotel_management.sqlite'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
    };
  } else {
    dataSourceOptions = {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'hotel_management',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
    };
  }

  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('✅ 数据库连接成功');

    // 获取仓库
    const userRepository = dataSource.getRepository('User');
    const hotelRepository = dataSource.getRepository('Hotel');
    const roomTypeRepository = dataSource.getRepository('RoomType');
    const hotelImageRepository = dataSource.getRepository('HotelImage');

    // 检查是否已有用户数据
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('⚠️  数据库已有用户数据，跳过用户初始化');
    } else {
      // 创建用户
      console.log('👤 创建测试用户...');
      for (const userData of seedUsers) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = userRepository.create({
          ...userData,
          password: hashedPassword,
        });
        await userRepository.save(user);
        console.log(`   ✓ 创建用户: ${userData.username} (角色: ${userData.role})`);
      }
    }

    // 获取已有酒店名称，用于追加时去重
    const existingHotels = await hotelRepository.find({ select: ['nameCn'] });
    const existingNames = new Set(existingHotels.map((h: any) => h.nameCn));
    const toInsert = seedHotels.filter((h) => !existingNames.has(h.nameCn));

    if (toInsert.length === 0) {
      console.log('⚠️  所有种子酒店已存在，跳过酒店初始化');
    } else {
      const merchant = await userRepository.findOne({ where: { role: 'merchant' } });
      if (merchant) {
        console.log(`🏨 创建演示酒店（共 ${toInsert.length} 家）...`);
        for (const hotelData of toInsert) {
          const { roomTypes, images, ...hotelInfo } = hotelData;

          const hotel = hotelRepository.create({
            ...hotelInfo,
            merchantId: (merchant as any).id,
          });
          const savedHotel = await hotelRepository.save(hotel);

          for (const roomType of roomTypes) {
            const rt = roomTypeRepository.create({
              ...roomType,
              hotelId: (savedHotel as any).id,
            });
            await roomTypeRepository.save(rt);
          }

          for (let i = 0; i < images.length; i++) {
            const img = hotelImageRepository.create({
              ...images[i],
              hotelId: (savedHotel as any).id,
              sortOrder: i,
            });
            await hotelImageRepository.save(img);
          }

          console.log(`   ✓ 创建酒店: ${hotelData.nameCn} (状态: ${hotelData.status})`);
        }
      }
    }

    console.log('\n🎉 种子数据初始化完成！');
    console.log('\n📋 测试账号信息:');
    console.log('┌─────────────┬───────────────┬──────────────┐');
    console.log('│ 角色        │ 用户名        │ 密码         │');
    console.log('├─────────────┼───────────────┼──────────────┤');
    console.log('│ 商户        │ merchant01    │ Test123456   │');
    console.log('│ 商户        │ merchant02    │ Test123456   │');
    console.log('│ 管理员      │ admin01       │ Admin123456  │');
    console.log('└─────────────┴───────────────┴──────────────┘');

  } catch (error) {
    console.error('❌ 种子数据初始化失败:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// 加载环境变量
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

seed();
