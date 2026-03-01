import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async save(data: {
    type: string;
    hotelId: number;
    hotelName: string;
    message: string;
    targetUserId: number;
    timestamp: number;
  }): Promise<void> {
    const entity = this.repo.create(data);
    await this.repo.save(entity);
  }

  /** 查找该角色的所有用户，为每人保存一条通知 */
  async saveForRole(
    role: UserRole,
    data: {
      type: string;
      hotelId: number;
      hotelName: string;
      message: string;
      timestamp: number;
    },
  ): Promise<void> {
    const users = await this.userRepo.find({ where: { role }, select: ['id'] });
    if (users.length === 0) return;
    const entities = users.map((u) => this.repo.create({ ...data, targetUserId: u.id }));
    await this.repo.save(entities);
  }

  async findUnread(userId: number): Promise<NotificationEntity[]> {
    return this.repo.find({
      where: { targetUserId: userId, isRead: false },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAllRead(userId: number): Promise<void> {
    await this.repo.update({ targetUserId: userId, isRead: false }, { isRead: true });
  }
}
