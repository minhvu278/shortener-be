import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    methods: 'GET,POST',
    allowedHeaders: 'X-Requested-With,Content-Type',
    credentials: true,
  });
  const PORT = process.env.PORT || 3001;
  await app.listen(PORT, '0.0.0.0');
}
bootstrap();
