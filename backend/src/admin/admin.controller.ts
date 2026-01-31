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

@ApiTags('审核')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly hotelsService: HotelsService) {}

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
  async approve(@Param('id', ParseIntPipe) id: number) {
    return this.hotelsService.approve(id);
  }

  @Post('hotels/:id/reject')
  @ApiOperation({ summary: '审核驳回' })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
  ) {
    return this.hotelsService.reject(id, reason);
  }

  @Post('hotels/:id/offline')
  @ApiOperation({ summary: '下线酒店' })
  async offline(@Param('id', ParseIntPipe) id: number) {
    return this.hotelsService.offline(id);
  }

  @Post('hotels/:id/online')
  @ApiOperation({ summary: '恢复上线' })
  async online(@Param('id', ParseIntPipe) id: number) {
    return this.hotelsService.online(id);
  }
}
