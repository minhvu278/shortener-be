import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
