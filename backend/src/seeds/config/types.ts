/**
 * 种子数据类型定义
 */
import { HotelStatus } from '../../hotels/entities/hotel.entity';

/** 用户种子数据类型 */
export interface SeedUser {
  username: string;
  password: string;
  role: 'merchant' | 'admin' | 'customer';
  nickname: string;
  phone: string;
}

/** 房型种子数据类型 */
export interface SeedRoomType {
  name: string;
  price: number;
  originalPrice: number;
  maxGuests: number;
  bedType: string;
  roomSize: number;
  description?: string;
  imageUrl?: string;
}

/** 酒店图片种子数据类型 */
export interface SeedHotelImage {
  imageUrl: string;
  description: string;
  sortOrder?: number;
}

/** 酒店种子数据类型 */
export interface SeedHotel {
  nameCn: string;
  nameEn: string;
  address: string;
  starRating: 1 | 2 | 3 | 4 | 5;
  openingDate: string;
  description: string;
  facilities: string[];
  nearbyAttractions: string[];
  transportation: string[];
  status: HotelStatus | 'approved' | 'pending';
  roomTypes: SeedRoomType[];
  images: SeedHotelImage[];
}

/** 房型配置类型 */
export interface RoomTypeConfig {
  name: string;
  priceBase: number;
  sizeMin: number;
  sizeMax: number;
  bedType: string;
  maxGuests: number;
}

/** 设施分组类型 */
export interface FacilityGroup {
  primary: string;
  tags: string[];
}

/** 价格区间类型 */
export interface PriceRange {
  min: number;
  max: number;
  label: string;
}
