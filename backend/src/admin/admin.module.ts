import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { HotelsModule } from '../hotels/hotels.module';

@Module({
  imports: [HotelsModule],
  controllers: [AdminController],
})
export class AdminModule {}
