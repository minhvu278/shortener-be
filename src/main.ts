import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  const PORT = process.env.PORT || 3001;
  await app.listen(PORT, '0.0.0.0');
}
bootstrap();
