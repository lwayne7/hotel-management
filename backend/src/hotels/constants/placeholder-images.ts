/**
 * 无图时按 hotelId 选一张唯一外观图，与 seeds 图库 HOTEL_EXTERIOR_IMAGES 前 44 张一致，避免遗漏或风格不一
 */
export const PLACEHOLDER_EXTERIOR_URLS = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
  'https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=800',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
  'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
  'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=800',
  'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
  'https://images.unsplash.com/photo-1520483691742-bada60a1edd6?w=800',
  'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800',
  'https://images.unsplash.com/photo-1587213811864-46e59f6873b1?w=800',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
  'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800',
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
  'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
  'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800',
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800',
];

/** 按 hotelId 取模得到唯一占位图 URL */
export function getPlaceholderImageUrl(hotelId: number): string {
  const hash = ((hotelId | 0) * 2654435761) >>> 0;
  return PLACEHOLDER_EXTERIOR_URLS[hash % PLACEHOLDER_EXTERIOR_URLS.length];
}
