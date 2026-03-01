import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  type: string;

  @Column()
  hotelId: number;

  @Column({ length: 200 })
  hotelName: string;

  @Column({ type: 'text' })
  message: string;

  @Index()
  @Column()
  targetUserId: number;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'bigint' })
  timestamp: number;

  @CreateDateColumn()
  createdAt: Date;
}
