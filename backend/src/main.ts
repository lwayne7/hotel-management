import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 设置全局路由前缀
  app.setGlobalPrefix('api');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 启用 CORS（开发环境放开，避免小程序/DevTools 由于 Origin/Referer 被拦截导致“请求成功但拿不到数据/直接失败”）
  const isProd = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: isProd
      ? (origin, callback) => {
          const allowed =
            !origin ||
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
            /^https?:\/\/(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+):(10086|5173|3001)$/.test(origin) ||
            /^https:\/\/servicewechat\.com$/.test(origin);
          callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
        }
      : true,
    credentials: true,
  });

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('易宿酒店管理系统 API')
    .setDescription('酒店预订平台管理端 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('认证', '用户注册与登录')
    .addTag('酒店', '酒店信息管理')
    .addTag('审核', '酒店审核管理')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // 启动信息：便于定位“请求到空库/命中错误数据库”
  try {
    const config = app.get(ConfigService);
    const dbType = config.get<string>('database.type');
    if (dbType === 'better-sqlite3') {
      console.log(`🗄️  DB: sqlite (${config.get('database.database')})`);
    } else {
      console.log(
        `🗄️  DB: postgres (${config.get('database.host')}:${config.get('database.port')}/${config.get('database.database')} user=${config.get('database.username')})`,
      );
    }
  } catch {
    // ignore
  }

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
