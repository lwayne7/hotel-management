import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { LoggingInterceptor } from './observability/logging.interceptor';

function configureCors(app: INestApplication) {
  const isProd = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: isProd
      ? (
          origin: string | undefined,
          callback: (err: Error | null, allow?: boolean) => void,
        ) => {
          const allowed =
            !origin ||
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
            /^https?:\/\/(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+):(10086|5173|3001)$/.test(
              origin,
            ) ||
            /^https:\/\/.*\.vercel\.app$/.test(origin) ||
            /^https:\/\/servicewechat\.com$/.test(origin);
          callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
        }
      : true,
    credentials: true,
  });
}

function setupSwagger(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('易宿酒店管理系统 API')
    .setDescription('酒店预订平台管理端 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('认证', '用户注册与登录')
    .addTag('酒店', '酒店信息管理')
    .addTag('审核', '酒店审核管理')
    .addTag('订单', '用户端下单与状态流转')
    .addTag('支付', '支付回调（幂等）')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/docs', app, document);
}

export function configureApp(
  app: INestApplication,
  options?: { swagger?: boolean },
): INestApplication {
  app.use(helmet());
  // API 版本前缀：所有路由带 /api/v1 前缀，后续新增 v2 时可并行部署
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(app.get(LoggingInterceptor));
  configureCors(app);

  if (options?.swagger) {
    setupSwagger(app);
  }

  return app;
}

export function logDatabaseInfo(app: INestApplication) {
  try {
    const configService = app.get(ConfigService);
    const dbType = configService.get<'postgres' | 'better-sqlite3'>(
      'database.type',
    );
    if (dbType === 'better-sqlite3') {
      console.log(
        `🗄️  DB: sqlite (${configService.get<string>('database.database')})`,
      );
    } else {
      console.log(
        `🗄️  DB: postgres (${configService.get<string>('database.host')}:${configService.get<number>('database.port')}/${configService.get<string>('database.database')})`,
      );
    }
  } catch {
    // ignore
  }
}
