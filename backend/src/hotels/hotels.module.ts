import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelsController } from './hotels.controller';
import { PublicHotelsController } from './public-hotels.controller';
import { HotelsService } from './hotels.service';
import { Hotel, RoomType, HotelImage } from './entities';
import { PriceUpdatesService } from './price-updates.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel, RoomType, HotelImage])],
  controllers: [HotelsController, PublicHotelsController],
  providers: [HotelsService, PriceUpdatesService],
  exports: [HotelsService, PriceUpdatesService],
})
export class HotelsModule {}
