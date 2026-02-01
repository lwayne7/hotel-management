import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';

@ApiTags('用户端-酒店')
@Controller('public/hotels')
export class PublicHotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  @ApiOperation({ summary: '获取已发布酒店列表（用户端，无需登录）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'starRating', required: false, type: Number })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  async list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
    @Query('city') city?: string,
    @Query('starRating') starRating?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    const filters: any = {};
    if (keyword) filters.keyword = keyword;
    if (city) filters.city = city;
    if (starRating) filters.starRating = parseInt(starRating, 10);
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    return this.hotelsService.findApprovedHotels(
      parseInt(page || '1', 10),
      parseInt(pageSize || '10', 10),
      Object.keys(filters).length ? filters : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取已发布酒店详情（用户端，无需登录）' })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.hotelsService.findOneApproved(id);
  }
}
