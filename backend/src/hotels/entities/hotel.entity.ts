import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum HotelStatus {
  DRAFT = 'draft',           // 草稿
  PENDING = 'pending',       // 待审核
  APPROVED = 'approved',     // 已通过（已发布）
  REJECTED = 'rejected',     // 已驳回
  OFFLINE = 'offline',       // 已下线
}

@Entity('hotels')
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nameCn: string;

  @Column({ length: 100, nullable: true })
  nameEn: string;

  @Column({ length: 255 })
  address: string;

  @Column({ type: 'int', default: 3 })
  starRating: number;

  @Column({ type: 'date', nullable: true })
  openingDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  facilities: string[];

  @Column({ type: 'jsonb', nullable: true })
  nearbyAttractions: string[];

  @Column({ type: 'jsonb', nullable: true })
  transportation: string[];

  @Column({
    type: 'enum',
    enum: HotelStatus,
    default: HotelStatus.DRAFT,
  })
  status: HotelStatus;

  @Column({ type: 'text', nullable: true })
  rejectReason: string | null;

  @Column()
  merchantId: number;

  @ManyToOne(() => User, (user) => user.hotels)
  @JoinColumn({ name: 'merchantId' })
  merchant: User;

  @OneToMany('RoomType', 'hotel', { cascade: true })
  roomTypes: any[];

  @OneToMany('HotelImage', 'hotel', { cascade: true })
  images: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
