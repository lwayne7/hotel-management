import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('room_inventories')
@Index(['roomTypeId', 'date'], { unique: true })
export class RoomInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomTypeId: number;

  /**
   * 库存日期（YYYY-MM-DD）。按“入住晚数”计：checkIn(含) 到 checkOut(不含) 每晚各占一份。
   */
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'int' })
  total: number;

  @Column({ type: 'int', default: 0 })
  reserved: number;

  @Column({ type: 'int', default: 0 })
  sold: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
