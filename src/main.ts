import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //bật validation toàn cục

  app.enableCors({
    origin: 'http://localhost:4000', // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allow these methods
    allowedHeaders: 'Content-Type, Authorization', // Allow these headers
    credentials: true, // Allow cookies or credentials if needed
  });
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
