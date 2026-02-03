import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// 城市列表
const cities = [
  '北京', '上海', '广州', '深圳', '成都', '杭州', '重庆', '西安', '苏州', '武汉',
  '南京', '天津', '郑州', '长沙', '沈阳', '青岛', '宁波', '昆明', '大连', '厦门',
  '合肥', '佛山', '福州', '哈尔滨', '济南', '温州', '长春', '石家庄', '常州', '泉州',
  '南宁', '贵阳', '南昌', '南通', '金华', '徐州', '太原', '嘉兴', '烟台', '惠州',
  '保定', '台州', '中山', '绍兴', '乌鲁木齐', '潍坊', '兰州', '扬州', '珠海', '镇江',
];

// 酒店名称前缀
const hotelPrefixes = [
  '希尔顿', '香格里拉', '万豪', '喜来登', '凯悦', '洲际', '威斯汀', '丽思卡尔顿',
  '四季', '半岛', '文华东方', '柏悦', '瑞吉', '康莱德', '安达仕', '英迪格',
  '假日', '皇冠假日', '智选假日', '维也纳', '如家', '汉庭', '锦江之星', '7天',
  '格林豪泰', '速8', '宜必思', '桔子', '全季', '亚朵', '麗枫', '喆啡',
  '锦江', '开元', '华住', '首旅', '金陵', '建国', '粤海', '君澜',
];

// 酒店名称后缀
const hotelSuffixes = [
  '大酒店', '酒店', '度假酒店', '商务酒店', '精品酒店', '客栈', '宾馆', '饭店',
  '国际酒店', '会议中心酒店', '温泉酒店', '花园酒店', '海景酒店', '湖景酒店',
];

// 地标/区域
const landmarks = [
  '市中心', '火车站', '机场', '商业区', '金融区', '科技园', '开发区', '新区',
  '老城区', '古城', '步行街', '广场', '公园', '湖畔', '江边', '海滨',
  '大学城', '会展中心', '体育中心', '文化中心', '购物中心', '商圈',
];

// 设施列表
const allFacilities = [
  '免费WiFi', '游泳池', '健身房', '餐厅', 'SPA', '24小时前台', '停车场',
  '会议室', '商务中心', '行李寄存', '洗衣服务', '接送服务', '租车服务',
  '儿童乐园', '宠物友好', '无障碍设施', '电梯', '空调', '暖气',
  '酒吧', '咖啡厅', '茶室', '图书馆', '花园', '露台', '阳台',
];

// 房型名称
const roomTypeNames = [
  '标准间', '大床房', '双床房', '豪华房', '行政房', '套房', '家庭房',
  '商务房', '景观房', '江景房', '海景房', '湖景房', '山景房', '园景房',
  '复式房', '阁楼房', '榻榻米房', '主题房', '蜜月房', '亲子房',
];

// 床型
const bedTypes = [
  '1.2m单床', '1.5m大床', '1.8m大床', '2.0m大床', '1.2m双床', '1.5m双床',
  '1.8m大床+沙发床', '2.0m大床+单床', '榻榻米', '上下铺',
];

// 生成随机整数
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机元素
function randomElement<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

// 生成随机数组子集
function randomSubset<T>(arr: T[], minCount: number, maxCount: number): T[] {
  const count = randomInt(minCount, Math.min(maxCount, arr.length));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 生成酒店名称
function generateHotelName(city: string, index: number): { nameCn: string; nameEn: string } {
  const prefix = randomElement(hotelPrefixes);
  const suffix = randomElement(hotelSuffixes);
  const landmark = randomElement(landmarks);
  
  const nameCn = `${city}${landmark}${prefix}${suffix}${index > 0 ? index : ''}`;
  const nameEn = `${prefix} Hotel ${city} ${landmark} ${index > 0 ? index : ''}`;
  
  return { nameCn, nameEn };
}

// 生成地址
function generateAddress(city: string): string {
  const districts = ['中心区', '新区', '开发区', '高新区', '经济区'];
  const roads = ['中山路', '人民路', '解放路', '建设路', '和平路', '友谊路', '文化路', '科技路'];
  const district = randomElement(districts);
  const road = randomElement(roads);
  const number = randomInt(1, 999);
  
  return `${city}市${district}${road}${number}号`;
}

// 生成描述
function generateDescription(city: string, hotelName: string): string {
  const templates = [
    `${hotelName}位于${city}市中心，交通便利，设施完善，是商务和休闲的理想选择。`,
    `坐落于${city}繁华地段，${hotelName}提供舒适的住宿环境和优质的服务。`,
    `${hotelName}地理位置优越，周边配套齐全，适合各类商务和旅游需求。`,
    `${city}${hotelName}以其优雅的环境和贴心的服务，为宾客提供难忘的入住体验。`,
  ];
  
  return randomElement(templates);
}

// 生成开业日期
function generateOpeningDate(): string {
  const year = randomInt(2000, 2024);
  const month = String(randomInt(1, 12)).padStart(2, '0');
  const day = String(randomInt(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 生成房型
function generateRoomTypes(count: number): any[] {
  const roomTypes: any[] = [];
  
  for (let i = 0; i < count; i++) {
    const name = randomElement(roomTypeNames);
    const basePrice = randomInt(200, 2000);
    const originalPrice = Math.floor(basePrice * randomInt(110, 150) / 100);
    
    roomTypes.push({
      name,
      price: basePrice,
      originalPrice,
      maxGuests: randomInt(1, 4),
      bedType: randomElement(bedTypes),
      roomSize: randomInt(20, 100),
    });
  }
  
  return roomTypes;
}

// 生成图片
function generateImages(count: number): any[] {
  const imageUrls = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
  ];
  
  const descriptions = ['外观', '大堂', '客房', '餐厅', '泳池', '健身房', '会议室', '景观'];
  
  const images: any[] = [];
  for (let i = 0; i < count; i++) {
    images.push({
      imageUrl: randomElement(imageUrls),
      description: randomElement(descriptions),
    });
  }
  
  return images;
}

// 生成大量酒店数据
async function generateLargeDataset() {
  console.log('🌱 开始生成大量测试数据...');

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

    const userRepository = dataSource.getRepository('User');
    const hotelRepository = dataSource.getRepository('Hotel');
    const roomTypeRepository = dataSource.getRepository('RoomType');
    const hotelImageRepository = dataSource.getRepository('HotelImage');

    // 获取商户
    let merchant = await userRepository.findOne({ where: { role: 'merchant' } });
    
    if (!merchant) {
      console.log('👤 创建默认商户...');
      const hashedPassword = await bcrypt.hash('Test123456', 10);
      merchant = userRepository.create({
        username: 'merchant01',
        password: hashedPassword,
        role: 'merchant',
        nickname: '测试商户',
        phone: '13800138001',
      });
      await userRepository.save(merchant);
    }

    const merchantId = (merchant as any).id;
    
    // 生成10000+条酒店数据
    const totalHotels = 10000;
    const batchSize = 100;
    let created = 0;

    console.log(`🏨 开始生成 ${totalHotels} 家酒店数据...`);
    console.log('   (批量处理，每批 100 家)');

    for (let batch = 0; batch < Math.ceil(totalHotels / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min((batch + 1) * batchSize, totalHotels);
      
      for (let i = batchStart; i < batchEnd; i++) {
        const city = randomElement(cities);
        const { nameCn, nameEn } = generateHotelName(city, i);
        const address = generateAddress(city);
        const starRating = randomInt(3, 5);
        const openingDate = generateOpeningDate();
        const description = generateDescription(city, nameCn);
        const facilities = randomSubset(allFacilities, 5, 12);
        const nearbyAttractions = randomSubset(landmarks, 2, 5);
        const transportation = [
          `地铁${randomInt(1, 10)}号线${randomElement(landmarks)}站`,
          `距机场约${randomInt(20, 60)}分钟`,
        ];
        
        // 状态分布: 80% approved, 15% pending, 5% rejected
        const rand = Math.random();
        const status = rand < 0.8 ? 'approved' : rand < 0.95 ? 'pending' : 'rejected';

        const hotel = hotelRepository.create({
          nameCn,
          nameEn,
          address,
          starRating,
          openingDate,
          description,
          facilities,
          nearbyAttractions,
          transportation,
          status,
          merchantId,
        });

        const savedHotel = await hotelRepository.save(hotel);
        const hotelId = (savedHotel as any).id;

        // 生成房型 (2-5个)
        const roomTypes = generateRoomTypes(randomInt(2, 5));
        for (const roomType of roomTypes) {
          const rt = roomTypeRepository.create({
            ...roomType,
            hotelId,
          });
          await roomTypeRepository.save(rt);
        }

        // 生成图片 (1-6张)
        const images = generateImages(randomInt(1, 6));
        for (let j = 0; j < images.length; j++) {
          const img = hotelImageRepository.create({
            ...images[j],
            hotelId,
            sortOrder: j,
          });
          await hotelImageRepository.save(img);
        }

        created++;
      }

      // 每批完成后显示进度
      const progress = ((batchEnd / totalHotels) * 100).toFixed(1);
      console.log(`   ✓ 进度: ${batchEnd}/${totalHotels} (${progress}%)`);
    }

    console.log(`\n🎉 成功生成 ${created} 家酒店数据！`);
    console.log('\n📊 数据统计:');
    console.log(`   - 总酒店数: ${created}`);
    console.log(`   - 覆盖城市: ${cities.length} 个`);
    console.log(`   - 平均每家酒店: 3-4 个房型, 2-4 张图片`);
    console.log(`   - 状态分布: ~80% 已审核, ~15% 待审核, ~5% 已拒绝`);

  } catch (error) {
    console.error('❌ 数据生成失败:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// 加载环境变量
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

generateLargeDataset();
