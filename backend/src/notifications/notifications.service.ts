import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
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
