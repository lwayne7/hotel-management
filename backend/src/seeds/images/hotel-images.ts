/**
 * 酒店图片库 - 精选Unsplash酒店相关图片（大规模版本）
 *
 * 为10000+酒店提供多样化图片，确保图片与酒店内容相关
 * 图片分配策略：
 * - 外观/大堂/泳池：基于 hotelId 的稳定映射，并使用「互质 stride 置换」降低连续 id 场景下的重复
 * - 房型图片：使用 hotelId + 房型名称哈希 的强哈希，保证同酒店不同房型尽量不同图
 *
 * 图片总数: 150+ 张；外观 90+ 张无重复，与酒店场景一致
 */

// ========== 酒店外观图片 (90+ 张，已去重) ==========
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
  // 追加外观补充图（与上方不重复），使外观图库接近 100 张，降低主图重复率
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
  'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=800',
  'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
  'https://images.unsplash.com/photo-1711743266323-5badf42d4797?w=800',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800',
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800',
  'https://images.unsplash.com/photo-1607320895054-c5c543e9a069?w=800',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
  'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800',
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800',
  'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
  'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800',
  'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800',
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
  'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=800',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
  'https://images.unsplash.com/photo-1668480441891-3744c25337a3?w=800',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800',
  'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800',
  'https://images.unsplash.com/photo-1536269404660-0a8d4e88bf1b?w=800', // 酒店外观（替换重复）
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
  'https://images.unsplash.com/photo-1570206986634-afd7cccb68d3?w=800', // 酒店建筑（替换重复）
  'https://images.unsplash.com/photo-1468824357306-a439d58ccb1c?w=800', // 度假村外观（替换重复）
  'https://images.unsplash.com/photo-1472510771109-39b92752a6b9?w=800', // 城市酒店（替换重复）
  'https://images.unsplash.com/photo-1723465308831-29da05e011f3?w=800', // 酒店外观（无重复）
  'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
  'https://images.unsplash.com/photo-1607320879139-1bb689f6a68f?w=800',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
  'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800',
  'https://images.unsplash.com/photo-1664111147905-5d2ecc5fb114?w=800',
  'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800',
  'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800',
  'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800',
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
  'https://images.unsplash.com/photo-1661016627085-4df08494de68?w=800', // 酒店外观（替换重复）
  'https://images.unsplash.com/photo-1661016630713-67e36bfc2285?w=800', // 海滨酒店（替换重复）
  'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=800', // 度假酒店外观（无重复）
  'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?w=800', // 特色酒店建筑（补充）
];

// ========== 酒店大堂/公共区域图片 (50张，扩充版) ==========
export const HOTEL_LOBBY_IMAGES = [
  // 现代风格大堂 (15张)
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
  'https://images.unsplash.com/photo-1711743266323-5badf42d4797?w=800', // 开放式大堂
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800', // 艺术风大堂
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800', // 明亮大堂
  'https://images.unsplash.com/photo-1607320895054-c5c543e9a069?w=800', // 温馨接待区
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', // 商务大堂
  // 豪华风格大堂 (15张)
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800', // 休闲大堂
  'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800', // 现代接待处
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800', // 豪华接待区
  'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800', // 精品大堂设计
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', // 艺术大堂
  'https://images.unsplash.com/photo-1587213811864-46e59f6873b1?w=800', // 精品酒店大堂
  'https://images.unsplash.com/photo-1578774204375-826dc5d996ed?w=800', // 复古大堂
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', // 欧式接待
  'https://images.unsplash.com/photo-1578898887932-dce23a595ad4?w=800', // 水晶吊灯大堂
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', // 度假酒店大堂
  'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800', // 阳光大堂
  'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800', // 典雅大堂
  'https://images.unsplash.com/photo-1519974719765-e6559eac2575?w=800', // 酒店走廊
  'https://images.unsplash.com/photo-1521783988139-89397d761dce?w=800', // 日式大堂
  'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800', // 简约接待区
  // 商务风格大堂 (15张)
  'https://images.unsplash.com/photo-1770017408222-dc83f61d9725?w=800', // 商务中心
  'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800', // 写字楼大堂
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800', // 办公大堂
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', // 摩天楼大堂
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800', // 现代商务大堂
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800', // 设计师大堂
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', // 极简大堂
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800', // 工业风大堂
  'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800', // 温暖色调大堂
  'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=800', // 酒店休息室
  // 度假风格大堂 (10张)
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', // 度假村大堂
  'https://images.unsplash.com/photo-1520483691742-bada60a1edd6?w=800', // 热带风格大堂
  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800', // 海边酒店大堂
  'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800', // 开放式度假大堂
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', // 城市精品大堂
  'https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=800', // 商务酒店大堂
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', // 度假村接待
  'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800', // 热带度假大堂
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', // 湖畔酒店大堂
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', // 现代建筑大堂
];

// ========== 泳池/SPA图片 (45张，扩充版) ==========
export const HOTEL_POOL_IMAGES = [
  // 无边泳池 (10张)
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', // 无边泳池
  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800', // 室外泳池
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', // 度假村泳池
  'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800', // 屋顶泳池
  'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800', // 室内泳池
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', // 豪华泳池
  'https://images.unsplash.com/photo-1607320879139-1bb689f6a68f?w=800', // SPA区域
  'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800', // 山景泳池
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', // 热带泳池
  'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800', // 花园泳池
  // 度假村泳池 (10张)
  'https://images.unsplash.com/photo-1664111147905-5d2ecc5fb114?w=800', // 私人泳池
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', // 夜景泳池
  'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800', // 海景泳池
  'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800', // SPA按摩
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', // 水疗中心
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', // 豪华水疗
  'https://images.unsplash.com/photo-1515362655824-9a74989f318e?w=800', // 室外按摩池
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800', // 别墅泳池
  'https://images.unsplash.com/photo-1531925470851-1b5896b67dcd?w=800', // 热带度假泳池
  'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800', // 海边泳池
  // 室内泳池/水疗 (10张)
  'https://images.unsplash.com/photo-1606601263580-45e02a23b0d8?w=800', // 室内恒温池
  'https://images.unsplash.com/photo-1661016631778-d9f53113d04f?w=800', // 水疗按摩
  'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800', // 海滨泳池
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800', // 自然泳池
  'https://images.unsplash.com/photo-1607320874448-d33f052651e2?w=800', // 豪华私人池
  'https://images.unsplash.com/photo-1628402275285-d1b1da65abf3?w=800', // 极简泳池设计
  'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800', // 酒店水疗室
  'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800', // 阳光泳池
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', // 按摩房
  'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?w=800', // 森林泳池
  // SPA与水疗 (10张)
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800', // SPA疗程
  'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800', // 芳疗室
  'https://images.unsplash.com/photo-1559599238-308793637427?w=800', // 豪华水疗中心
  'https://images.unsplash.com/photo-1517638851339-a711cfcf3279?w=800', // 按摩服务
  'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800', // 花瓣浴
  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800', // 水疗池
  'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800', // 禅意水疗
  'https://images.unsplash.com/photo-1628402275267-8a0b1eefb206?w=800', // 户外水疗
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', // 精油按摩
  'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800', // 蒸汽房
  // 特色泳池 (5张)
  'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800', // 日落泳池
  'https://images.unsplash.com/photo-1520483691742-bada60a1edd6?w=800', // 花园泳池区
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', // 湖景泳池
  'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=800', // 海边无边池
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800', // 热带度假池
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
  'https://images.unsplash.com/photo-1668480441891-3744c25337a3?w=800', // 高级大床房
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', // 城景大床房
  'https://images.unsplash.com/photo-1607320895054-c5c543e9a069?w=800', // 典雅大床房
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
  'https://images.unsplash.com/photo-1711743266323-5badf42d4797?w=800', // 明亮双床房
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
  'https://images.unsplash.com/photo-1607320895054-c5c543e9a069?w=800', // 典雅套房
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
  'https://images.unsplash.com/photo-1668480441891-3744c25337a3?w=800', // 高级家庭房
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', // 豪华家庭房
  'https://images.unsplash.com/photo-1607320895054-c5c543e9a069?w=800', // 典雅家庭房
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
  'https://images.unsplash.com/photo-1711743266323-5badf42d4797?w=800', // 明亮标间
];

// 通用房间图片（备用）- 组合所有房型图片
export const HOTEL_ROOM_IMAGES = [
  ...KING_BED_ROOM_IMAGES,
  ...TWIN_BED_ROOM_IMAGES,
  ...SUITE_ROOM_IMAGES,
  ...FAMILY_ROOM_IMAGES,
];

// 去重：各房型图库之间不重复 URL，避免「大床房」与「商务套房」等选到同一张图
const _usedRoomUrls = new Set<string>();
const uniqueFrom = (arr: string[], used: Set<string>): string[] => {
  const out = arr.filter((u) => !used.has(u));
  arr.forEach((u) => used.add(u));
  return out.length > 0 ? out : arr;
};
const KING_UNIQUE = uniqueFrom([...KING_BED_ROOM_IMAGES], _usedRoomUrls);
const TWIN_UNIQUE = uniqueFrom([...TWIN_BED_ROOM_IMAGES], _usedRoomUrls);
const SUITE_UNIQUE = uniqueFrom([...SUITE_ROOM_IMAGES], _usedRoomUrls);
const FAMILY_UNIQUE = uniqueFrom([...FAMILY_ROOM_IMAGES], _usedRoomUrls);
const STANDARD_UNIQUE = uniqueFrom([...STANDARD_ROOM_IMAGES], _usedRoomUrls);

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

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

/**
 * 选择一个与 mod 互质的 stride（用于把连续 id 映射成一个「无碰撞」的置换序列）。
 * 这样在分页/连续 id 的场景下，能显著降低「同页不同酒店主图重复」的概率。
 */
function pickCoprimeStride(mod: number): number {
  const m = Math.floor(Math.abs(mod));
  if (m <= 2) return 1;
  const preferred = [37, 31, 29, 23, 19, 17, 13, 11, 7, 5, 3, 2];
  for (const s of preferred) {
    if (s < m && gcd(s, m) === 1) return s;
  }
  for (let s = m - 1; s >= 2; s--) {
    if (gcd(s, m) === 1) return s;
  }
  return 1;
}

function permuteIndex(base: number, mod: number, stride: number): number {
  const m = Math.floor(Math.abs(mod));
  if (m <= 0) return 0;
  const b = ((Math.floor(base) % m) + m) % m;
  return (b * stride) % m;
}

/**
 * 强哈希：将 (hotelId, cityIndex, offset) 映射到 32 位均匀分布
 * 使用多轮混合确保连续的hotelId产生完全不同的索引
 * 参考 splitmix64 和 MurmurHash3 finalizer 设计
 */
function hashImageSeed(
  hotelId: number,
  cityIndex: number = 0,
  offset: number = 0,
): number {
  // 将三个参数组合成一个64位采样点（模拟）
  // 使用不同的乘数确保不同参数的贡献不会相互抵消
  let x = ((hotelId | 0) ^ 0x9e3779b9) >>> 0;
  x = (x + (cityIndex | 0) * 0x517cc1b7) >>> 0;
  x = (x + (offset | 0) * 0x85ebca6b) >>> 0;

  // 第一轮混合：splitmix 风格
  x = ((x ^ (x >>> 16)) * 0x85ebca6b) >>> 0;
  x = ((x ^ (x >>> 13)) * 0xc2b2ae35) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;

  // 第二轮混合：确保小差异导致大变化
  x = ((x ^ (x >>> 15)) * 0x45d9f3b) >>> 0;
  x = ((x ^ (x >>> 15)) * 0x45d9f3b) >>> 0;
  x = (x ^ (x >>> 15)) >>> 0;

  return x;
}

/**
 * 用种子从数组中稳定取图，保证同一酒店/房型始终得到同一张语义化图片
 */
function pickFromArray<T>(arr: T[], seed: number): T {
  const idx = (seed >>> 0) % arr.length;
  return arr[idx];
}

/** 房型名称简单哈希，用于同一酒店内不同房型选到不同索引，避免不同房型同图 */
function hashRoomTypeName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return h >>> 0;
}

/**
 * 根据房型名称和酒店 id 获取对应语义化房型图片
 * 使用去重后的图库（各房型图库无重复 URL），且种子含房型名称哈希，保证同一酒店下不同房型不同图
 */
export function getRoomImageByType(
  roomTypeName: string,
  hotelId: number,
  roomIndex: number = 0,
  cityIndex: number = 0,
): string {
  const offset = 500 + roomIndex * 37;
  const seed = hashImageSeed(hotelId, cityIndex, offset);
  const nameHash = hashRoomTypeName(roomTypeName || '');
  const combinedSeed = (seed + nameHash) >>> 0;
  const name = roomTypeName || '';
  if (name.includes('套房')) return pickFromArray(SUITE_UNIQUE, combinedSeed);
  if (name.includes('大床') || name.includes('豪华'))
    return pickFromArray(KING_UNIQUE, combinedSeed);
  if (name.includes('双床') || name.includes('标准间'))
    return pickFromArray(TWIN_UNIQUE, combinedSeed);
  if (name.includes('家庭') || name.includes('亲子'))
    return pickFromArray(FAMILY_UNIQUE, combinedSeed);
  return pickFromArray(STANDARD_UNIQUE, combinedSeed);
}

const EXTERIOR_STRIDE = pickCoprimeStride(HOTEL_EXTERIOR_IMAGES.length);
const LOBBY_STRIDE = pickCoprimeStride(HOTEL_LOBBY_IMAGES.length);
const POOL_STRIDE = pickCoprimeStride(HOTEL_POOL_IMAGES.length);

/**
 * 根据酒店ID和城市索引获取外观图片（主图）- 使用精选酒店外观图
 * 使用双层策略确保：1) 全局均匀分布 2) 相邻ID获得不同图片
 * @param offset 可选偏移，用于取第二张外观等（如 400）
 */
export function getExteriorImage(
  hotelId: number,
  _cityIndex: number = 0,
  offset: number = 0,
): string {
  const total = HOTEL_EXTERIOR_IMAGES.length;

  if (total === 0) return '';

  // 目标：减少「同页不同酒店主图重复」与「同城列表页重复」。
  // 对于真实列表场景：hotelId 通常单调递增；按 (hotelId + offset) 做互质 stride 置换，
  // 可以保证在外观图库容量内形成无碰撞的遍历序列（比简单 hash->mod 更不易产生小样本碰撞）。
  // cityIndex 不参与映射以避免把同一个 hotelId 映射到多个不同序列造成意外碰撞。
  const base = hotelId - 1 + (offset | 0);
  const idx = permuteIndex(base, total, EXTERIOR_STRIDE);
  return HOTEL_EXTERIOR_IMAGES[idx];
}

/**
 * 根据酒店ID和城市索引获取房间图片（通用）- 使用精选客房图
 */
export function getRoomImage(hotelId: number, cityIndex: number = 0): string {
  const seed = hashImageSeed(hotelId, cityIndex, 100);
  return pickFromArray(HOTEL_ROOM_IMAGES, seed);
}

/**
 * 根据酒店ID和城市索引获取大堂图片 - 使用精选大堂图
 * 使用强哈希确保不同酒店获得不同图片
 */
export function getLobbyImage(
  hotelId: number,
  cityIndex: number = 0,
  offset: number = 0,
): string {
  const total = HOTEL_LOBBY_IMAGES.length;
  if (total === 0) return '';
  const seed = hashImageSeed(hotelId, cityIndex, 200 + offset);
  const idx = seed % total;
  return HOTEL_LOBBY_IMAGES[idx];
}

/**
 * 根据酒店ID和城市索引获取泳池图片 - 使用精选泳池/SPA图
 * 使用强哈希确保不同酒店获得不同图片
 */
export function getPoolImage(
  hotelId: number,
  cityIndex: number = 0,
  offset: number = 0,
): string {
  const total = HOTEL_POOL_IMAGES.length;
  if (total === 0) return '';
  const seed = hashImageSeed(hotelId, cityIndex, 300 + offset);
  const idx = seed % total;
  return HOTEL_POOL_IMAGES[idx];
}

/**
 * 生成酒店图片数组（仅外观/大堂/泳池，不含客房图，避免与房型图重复）
 * 使用 hotelId 做稳定分配，优先减少「不同酒店图片重复」与「无图」问题
 */
export function generateHotelImages(
  hotelId: number,
  cityIndex: number = 0,
  count: number = 3,
): { imageUrl: string; description: string }[] {
  // 规范数量：至少 1 张，最多 4 张（目前前端也只展示少量主图）
  const targetCount = Math.max(1, Math.min(4, count));

  // 强保证：当酒店数量不大时，为每家酒店分配「不重叠」的图片块，
  // 彻底避免「不同酒店图片重复」这一常见演示痛点。
  // 仅使用外观图库（已去重且数量最大），避免与房型图发生重复。
  const exteriorTotal = HOTEL_EXTERIOR_IMAGES.length;
  const blockSize = 4; // 固定块大小：不同 count 下也能保证跨酒店不重叠
  const blockCapacity =
    exteriorTotal > 0 ? Math.floor(exteriorTotal / blockSize) : 0;
  if (hotelId > 0 && hotelId <= blockCapacity) {
    const start = (hotelId - 1) * blockSize;
    const out: { imageUrl: string; description: string }[] = [];
    for (let i = 0; i < targetCount; i++) {
      const url = HOTEL_EXTERIOR_IMAGES[start + i];
      if (url) {
        out.push({
          imageUrl: url,
          description: '酒店外观',
        });
      }
    }
    if (out.length > 0) return out;
  }

  const result: { imageUrl: string; description: string }[] = [];
  const used = new Set<string>();

  const pushUnique = (imageUrl: string | undefined, description: string) => {
    if (!imageUrl) return;
    if (used.has(imageUrl)) return;
    used.add(imageUrl);
    result.push({ imageUrl, description });
  };

  const pushWithRetry = (
    getter: (attempt: number) => string,
    description: string,
    maxAttempts: number = 6,
  ) => {
    for (let i = 0; i < maxAttempts && result.length < targetCount; i++) {
      pushUnique(getter(i), description);
    }
  };

  // 1. 主外观图（封面）
  pushUnique(getExteriorImage(hotelId, cityIndex, 0), '酒店外观');

  // 2. 大堂、泳池、副外观：若遇到重复则多次尝试不同 offset，尽量保证「同酒店不同图」
  if (targetCount >= 2)
    pushWithRetry((i) => getLobbyImage(hotelId, cityIndex, i), '酒店大堂', 6);
  if (targetCount >= 3)
    pushWithRetry((i) => getPoolImage(hotelId, cityIndex, i), '泳池设施', 6);
  if (targetCount >= 4)
    pushWithRetry(
      (i) => getExteriorImage(hotelId, cityIndex, 400 + i * 400),
      '酒店外观',
      6,
    );

  // 3. 如果因为去重导致数量不足，则继续用不同 offset 的外观图补齐，
  //    直到达到目标数量或外观图库已被当前酒店用完
  let extraOffset = 800;
  while (
    result.length < targetCount &&
    used.size < HOTEL_EXTERIOR_IMAGES.length
  ) {
    const url = getExteriorImage(hotelId, cityIndex, extraOffset);
    extraOffset += 400;
    if (!used.has(url)) {
      used.add(url);
      result.push({
        imageUrl: url,
        description: '酒店外观',
      });
    }
  }

  return result;
}

/**
 * 生成房型图片
 * 根据房型名称匹配合适的图片，使用种子确保唯一性
 */
export function generateRoomTypeImage(
  hotelId: number,
  roomTypeIndex: number,
  roomTypeName?: string,
  cityIndex: number = 0,
): string {
  if (roomTypeName) {
    return getRoomImageByType(roomTypeName, hotelId, roomTypeIndex, cityIndex);
  }
  const seed =
    (hashImageSeed(hotelId, cityIndex, 50) >>> 0) + roomTypeIndex * 50;
  const rng = seededRandom(seed || 1);
  const idx = Math.floor(rng() * HOTEL_ROOM_IMAGES.length);
  return HOTEL_ROOM_IMAGES[idx];
}
