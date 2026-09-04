import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 🔒 ENFORCE GLOBAL JWT AUTHENTICATION GUARD ON ALL ROUTES
  app.useGlobalGuards(new JwtAuthGuard());

  app.enableCors();

  const PORT = process.env.PORT || 4000;
  await app.listen(PORT);
  console.log(`===================================================`);
  console.log(`🚀 AIIA CTMS Backend Microservices live on Port ${PORT}`);
  console.log(`🔒 Global Keycloak JWT AuthGuard active on all endpoints`);
  console.log(`===================================================`);
}
bootstrap();
