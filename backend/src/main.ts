import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefix all routes with /api
  app.setGlobalPrefix('api');

  // Enable automatic request validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Enable CORS
  app.enableCors();

  const PORT = process.env.PORT || 4000;
  await app.listen(PORT);
  console.log(`===================================================`);
  console.log(`🚀 AIIA CTMS Backend Microservices live on Port ${PORT}`);
  console.log(`🌐 Routed via NGINX Gateway at http://localhost/api/`);
  console.log(`===================================================`);
}
bootstrap();
