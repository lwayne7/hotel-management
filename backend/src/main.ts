import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp, logDatabaseInfo } from './app.bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app, { swagger: true });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logDatabaseInfo(app);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/v1/docs`);
}
void bootstrap();
