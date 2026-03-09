import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config';
import { AppCacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HotelsModule } from './hotels/hotels.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ObservabilityModule } from './observability/observability.module';
import { RequestContextMiddleware } from './observability/request-context.middleware';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      // 使用绝对路径，避免从不同工作目录启动时读不到 env 文件
      envFilePath: [path.resolve(__dirname, '../.env.local'), path.resolve(__dirname, '../.env')],
    }),
    // 定时任务
    ScheduleModule.forRoot(),
    // 全局缓存
    AppCacheModule,
    // 全局限流：每个 IP 每分钟最多 60 次请求
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get('database.type');

        if (dbType === 'better-sqlite3') {
          return {
            type: 'better-sqlite3',
            database: configService.get('database.database'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: configService.get('database.synchronize'),
            logging: configService.get('database.logging'),
          };
        }

        return {
          type: 'postgres',
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.database'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('database.synchronize'),
          logging: configService.get('database.logging'),
        };
      },
      inject: [ConfigService],
    }),
    // 业务模块
    AuthModule,
    UsersModule,
    HotelsModule,
    AdminModule,
    NotificationsModule,
    InventoryModule,
    OrdersModule,
    PaymentsModule,
    ObservabilityModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
