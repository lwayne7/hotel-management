import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersExpirationService } from './orders-expiration.service';
import { Order } from './order.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { RoomType } from '../hotels/entities/room-type.entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Hotel, RoomType]),
    InventoryModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersExpirationService],
  exports: [OrdersService],
})
export class OrdersModule {}
