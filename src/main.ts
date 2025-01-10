import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true // delete undefined dto attribute
  }))

  const allowedIPs = ['http://host.docker.internal/3000', 'http://localhost:3000', 'http://localhost:5173'];

  app.enableCors({
    origin: allowedIPs,  // Ganti dengan URL frontend Anda
    methods: 'GET, POST, PUT, DELETE', // Tambahkan metode yang diizinkan sesuai kebutuhan
    allowedHeaders: 'Content-Type, Authorization',  // Header yang diizinkan
  });

  await app.listen(3000);
}
bootstrap();
