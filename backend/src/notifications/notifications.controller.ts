import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators';
import { NotificationsService } from './notifications.service';

@ApiTags('通知')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('mine')
  @ApiOperation({ summary: '获取当前用户未读通知' })
  async getMyNotifications(@CurrentUser() user: { id: number }) {
    return this.notificationsService.findUnread(user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: '标记所有通知为已读' })
  async markAllRead(@CurrentUser() user: { id: number }) {
    await this.notificationsService.markAllRead(user.id);
    return { success: true };
  }
}
