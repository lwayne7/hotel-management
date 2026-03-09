import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomInventory } from './room-inventory.entity';
import { InventoryService } from './inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoomInventory])],
  providers: [InventoryService],
  exports: [InventoryService, TypeOrmModule],
})
export class InventoryModule {}
