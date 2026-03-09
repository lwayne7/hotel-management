import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Hotel } from './hotel.entity';

export enum DiscountType {
  NONE = 'none',
  PERCENTAGE = 'percentage', // 百分比折扣，如8折
  FIXED = 'fixed', // 固定减免，如减50元
  PACKAGE = 'package', // 套餐优惠
}

@Entity('room_types')
@Index(['hotelId', 'price']) // 按酒店查房型并按价格排序
export class RoomType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: DiscountType.NONE,
  })
  discountType: DiscountType;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountValue: number;

  @Column({ type: 'text', nullable: true })
  discountDescription: string;

  @Column({ type: 'int', default: 2 })
  maxGuests: number;

  @Column({ type: 'text', nullable: true })
  bedType: string;

  @Column({ type: 'int', nullable: true })
  roomSize: number;

  @Column({ type: 'simple-json', nullable: true })
  amenities: string[];

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  hotelId: number;

  @ManyToOne(() => Hotel, (hotel) => hotel.roomTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotelId' })
  hotel: Hotel;
}
