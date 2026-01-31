import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Hotel } from './hotel.entity';

export enum DiscountType {
  NONE = 'none',
  PERCENTAGE = 'percentage',  // 百分比折扣，如8折
  FIXED = 'fixed',            // 固定减免，如减50元
  PACKAGE = 'package',        // 套餐优惠
}

@Entity('room_types')
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
    type: 'enum',
    enum: DiscountType,
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

  @Column({ type: 'jsonb', nullable: true })
  amenities: string[];

  @Column()
  hotelId: number;

  @ManyToOne(() => Hotel, (hotel) => hotel.roomTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotelId' })
  hotel: Hotel;
}
