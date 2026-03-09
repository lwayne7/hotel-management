/**
 * 无图时按 hotelId 选一张外观图，与 seeds 图库 HOTEL_EXTERIOR_IMAGES 对齐，避免遗漏或风格不一
 */
import {
  getExteriorImage,
  HOTEL_EXTERIOR_IMAGES,
} from '../../seeds/images/hotel-images';

export const PLACEHOLDER_EXTERIOR_URLS = [...HOTEL_EXTERIOR_IMAGES];

/** 无图占位：按 hotelId 稳定映射到外观图 */
export function getPlaceholderImageUrl(hotelId: number): string {
  // 复用 seeds 的外观图分配逻辑，优先减少列表页重复（同一酒店稳定映射）
  const url = getExteriorImage(hotelId, 0, 0);
  return url || PLACEHOLDER_EXTERIOR_URLS[0] || '';
}
