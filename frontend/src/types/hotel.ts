/** 酒店状态 */
export type HotelStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'offline';

/** 折扣类型 */
export type DiscountType = 'none' | 'percentage' | 'fixed' | 'package';

/** 房型 */
export interface RoomType {
  id?: number;
  name: string;
  price: number;
  originalPrice?: number;
  discountType: DiscountType;
  discountValue?: number;
  discountDescription?: string;
  maxGuests: number;
  bedType?: string;
  roomSize?: number;
  amenities?: string[];
  imageUrl?: string;
  description?: string;
}

/** 酒店图片 */
export interface HotelImage {
  id?: number;
  imageUrl: string;
  sortOrder: number;
  description?: string;
}

/** 酒店 */
export interface Hotel {
  id: number;
  nameCn: string;
  nameEn?: string;
  address: string;
  starRating: number;
  openingDate?: string;
  description?: string;
  facilities?: string[];
  nearbyAttractions?: string[];
  transportation?: string[];
  status: HotelStatus;
  rejectReason?: string;
  merchantId?: number;
  merchant?: { id: number; username: string; nickname?: string };
  roomTypes?: RoomType[];
  images?: HotelImage[];
  createdAt: string;
  updatedAt: string;
}
