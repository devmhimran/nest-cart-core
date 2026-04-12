// api/index.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Express } from 'express';
// ... import your pipes/middleware here

export default async () => {
  const app = await NestFactory.create(AppModule);

  // Apply the same config as main.ts
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: true, credentials: true });

  await app.init(); // Initialize but DON'T listen

  const instance = app.getHttpAdapter().getInstance() as Express;
  return instance;
};
