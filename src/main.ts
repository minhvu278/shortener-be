import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  app.setGlobalPrefix('api', {
    exclude: [{ path: ':code', method: RequestMethod.GET }],
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'X-Requested-With,Content-Type,Authorization',
    credentials: true,
    exposedHeaders: ['Location'],
  });
  const PORT = process.env.PORT || 3001;
  await app.listen(PORT, '0.0.0.0');
}
bootstrap();
