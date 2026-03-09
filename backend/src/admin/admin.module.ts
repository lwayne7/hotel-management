import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { HotelsModule } from '../hotels/hotels.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [HotelsModule, AuditModule],
  controllers: [AdminController],
})
export class AdminModule {}
