import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Hotel } from '../../hotels/entities/hotel.entity';

export enum UserRole {
  MERCHANT = 'merchant',
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.MERCHANT,
  })
  role: UserRole;

  @Column({ length: 100, nullable: true })
  nickname: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  /** Token 版本号：登出时递增，使所有旧 refresh_token 失效 */
  @Column({ default: 0 })
  tokenVersion: number;

  @OneToMany(() => Hotel, (hotel) => hotel.merchant)
  hotels: Hotel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
