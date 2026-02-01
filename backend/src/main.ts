import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  // 启用 CORS（Vite 5173/3001、Taro H5 10086、本机/局域网）
  app.enableCors({
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        /^https?:\/\/(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+):(10086|5173|3001)$/.test(origin);
      callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
    },
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
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
