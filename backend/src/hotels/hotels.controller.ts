import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { HotelsService } from './hotels.service';
import { CreateHotelDto, UpdateHotelDto } from './dto';
import { Roles, CurrentUser } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';
import { UserRole } from '../users/entities/user.entity';
import { HotelStatus } from './entities/hotel.entity';

@ApiTags('酒店')
@Controller('hotels')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '创建酒店（商户）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(
    @Body() createHotelDto: CreateHotelDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.hotelsService.create(createHotelDto, user.id);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '获取我的酒店列表（商户）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: HotelStatus })
  async findMy(
    @CurrentUser() user: { id: number },
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: HotelStatus,
  ) {
    return this.hotelsService.findByMerchant(
      user.id,
      page || 1,
      pageSize || 10,
      status,
    );
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '获取商户统计数据' })
  async getMerchantStatistics(@CurrentUser() user: { id: number }) {
    return this.hotelsService.getMerchantStatistics(user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '获取我的酒店列表（商户）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: HotelStatus })
  async listMyHotels(
    @CurrentUser() user: { id: number },
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: HotelStatus,
  ) {
    return this.hotelsService.findByMerchant(
      user.id,
      page || 1,
      pageSize || 10,
      status,
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '获取酒店详情（商户）' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.hotelsService.findOneForMerchant(id, user.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '更新酒店信息（商户）' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHotelDto: UpdateHotelDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.hotelsService.update(id, updateHotelDto, user.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '更新酒店信息（商户）' })
  async replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHotelDto: UpdateHotelDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.hotelsService.update(id, updateHotelDto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '删除酒店（商户）' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    await this.hotelsService.remove(id, user.id);
    return { message: '删除成功' };
  }

  @Post(':id/submit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '提交审核（商户）' })
  async submitForReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.hotelsService.submitForReview(id, user.id);
  }
}
