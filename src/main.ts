import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { seedDatabase } from './common/database/seeds/initial-seed';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Seed the database after app initialization
  if (process.env.NODE_ENV === 'development') {
    const dataSource = app.get(DataSource);
    await seedDatabase(dataSource);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('');
  console.log('🚁 ====================================');
  console.log('   Drone Dispatch Service Started');
  console.log('   ====================================');
  console.log(`   🌐 Server: http://localhost:${port}`);
  console.log(`   📡 API: http://localhost:${port}/api`);
  console.log('   ====================================');
  console.log('');
}

bootstrap();