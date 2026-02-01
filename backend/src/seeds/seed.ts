import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

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
    status: 'pending',
    roomTypes: [
      { name: '豪华江景房', price: 1299, originalPrice: 1599, maxGuests: 2, bedType: '2m大床', roomSize: 50 },
      { name: '总统套房', price: 8888, originalPrice: 9999, maxGuests: 4, bedType: '2m大床', roomSize: 150 },
    ],
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', description: '酒店大堂' },
    ],
  },
];

async function seed() {
  console.log('🌱 开始初始化种子数据...');

  // 根据环境变量判断数据库类型
  const dbType = process.env.DB_TYPE || 'postgres';
  
  let dataSourceOptions: any;
  
  if (dbType === 'sqlite') {
    dataSourceOptions = {
      type: 'better-sqlite3',
      database: process.env.DB_DATABASE || 'hotel_management.sqlite',
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

    // 检查是否已有酒店数据
    const existingHotels = await hotelRepository.count();
    if (existingHotels > 0) {
      console.log('⚠️  数据库已有酒店数据，跳过酒店初始化');
    } else {
      // 获取第一个商户用户
      const merchant = await userRepository.findOne({ where: { role: 'merchant' } });
      if (merchant) {
        console.log('🏨 创建演示酒店...');
        for (const hotelData of seedHotels) {
          const { roomTypes, images, ...hotelInfo } = hotelData;
          
          // 创建酒店
          const hotel = hotelRepository.create({
            ...hotelInfo,
            merchantId: (merchant as any).id,
          });
          const savedHotel = await hotelRepository.save(hotel);
          
          // 创建房型
          for (const roomType of roomTypes) {
            const rt = roomTypeRepository.create({
              ...roomType,
              hotelId: (savedHotel as any).id,
            });
            await roomTypeRepository.save(rt);
          }
          
          // 创建图片
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
