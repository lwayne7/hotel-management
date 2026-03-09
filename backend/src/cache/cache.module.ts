import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

/**
 * 全局缓存模块。
 * 默认使用内存缓存（cache-manager 内置），生产环境可替换为 Redis store。
 * TTL 30 秒，最多缓存 500 个 key。
 */
@Global()
@Module({
  imports: [
    NestCacheModule.register({
      ttl: 30_000,
      max: 500,
    }),
  ],
  exports: [NestCacheModule],
})
export class AppCacheModule {}
