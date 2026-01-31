import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Hotel } from '../../hotels/entities/hotel.entity';

export enum UserRole {
  MERCHANT = 'merchant',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MERCHANT,
  })
  role: UserRole;

  @Column({ length: 100, nullable: true })
  nickname: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @OneToMany(() => Hotel, (hotel) => hotel.merchant)
  hotels: Hotel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
