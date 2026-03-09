import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { HotelsService } from '../hotels/hotels.service';
import { Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';
import { UserRole } from '../users/entities/user.entity';
import { HotelStatus } from '../hotels/entities/hotel.entity';
import { RejectHotelDto } from './dto';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../auth/decorators';

@ApiTags('审核')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly hotelsService: HotelsService,
    private readonly auditService: AuditService,
  ) {}

  @Get('statistics')
  @ApiOperation({ summary: '获取管理员统计数据' })
  async getAdminStatistics() {
    return this.hotelsService.getAdminStatistics();
  }

  @Get('hotels')
  @ApiOperation({ summary: '获取酒店列表（管理员）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: HotelStatus })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: HotelStatus,
  ) {
    return this.hotelsService.findAllForAdmin(page || 1, pageSize || 10, status);
  }

  @Get('hotels/:id')
  @ApiOperation({ summary: '获取酒店详情（管理员）' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hotelsService.findOne(id);
  }

  @Post('hotels/:id/approve')
  @ApiOperation({ summary: '审核通过' })
  async approve(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    const hotel = await this.hotelsService.approve(id);
    await this.auditService.log(
      { actorType: 'admin', actorId: user.id },
      {
        action: 'hotel_approved',
        targetType: 'hotel',
        targetId: id,
        payload: { status: hotel.status },
      },
    );
    return hotel;
  }

  @Post('hotels/:id/reject')
  @ApiOperation({ summary: '审核驳回' })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectHotelDto: RejectHotelDto,
    @CurrentUser() user: { id: number },
  ) {
    const hotel = await this.hotelsService.reject(id, rejectHotelDto.reason);
    await this.auditService.log(
      { actorType: 'admin', actorId: user.id },
      {
        action: 'hotel_rejected',
        targetType: 'hotel',
        targetId: id,
        payload: { reason: rejectHotelDto.reason },
      },
    );
    return hotel;
  }

  @Post('hotels/:id/offline')
  @ApiOperation({ summary: '下线酒店' })
  async offline(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    const hotel = await this.hotelsService.offline(id);
    await this.auditService.log(
      { actorType: 'admin', actorId: user.id },
      {
        action: 'hotel_offline',
        targetType: 'hotel',
        targetId: id,
      },
    );
    return hotel;
  }

  @Post('hotels/:id/online')
  @ApiOperation({ summary: '恢复上线' })
  async online(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    const hotel = await this.hotelsService.online(id);
    await this.auditService.log(
      { actorType: 'admin', actorId: user.id },
      {
        action: 'hotel_online',
        targetType: 'hotel',
        targetId: id,
      },
    );
    return hotel;
  }
}
