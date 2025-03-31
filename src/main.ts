import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with strict options
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  // Enable Helmet
  app.use(helmet());

  // Enable global rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các field không có trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu có field thừa
      transform: true, // Chuyển form-data string => number
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
