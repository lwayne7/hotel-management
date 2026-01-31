import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Hotel } from './hotel.entity';

@Entity('hotel_images')
export class HotelImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  imageUrl: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ length: 100, nullable: true })
  description: string;

  @Column()
  hotelId: number;

  @ManyToOne(() => Hotel, (hotel) => hotel.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotelId' })
  hotel: Hotel;
}
