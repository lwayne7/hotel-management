import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { Hotel, RoomType, HotelImage } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel, RoomType, HotelImage])],
  controllers: [HotelsController],
  providers: [HotelsService],
  exports: [HotelsService],
})
export class HotelsModule {}
