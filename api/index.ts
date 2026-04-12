import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Express } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export default async () => {
  const app = await NestFactory.create(AppModule);

  // 1. Apply the EXACT same middleware as main.ts
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Add production domains here too
    credentials: true,
  });

  // 2. Swagger Setup (Necessary if you want docs in production)
  const config = new DocumentBuilder()
    .setTitle('Nest Cart Core')
    .setDescription('Documentation for Nest Nexus API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/v1/docs', app, document, {
    customSiteTitle: 'Nest Nexus API Docs',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });

  // 3. Initialize the Nest context
  await app.init();

  // 4. Get the underlying Express instance
  const instance = app.getHttpAdapter().getInstance() as Express;

  // 5. Handle the request
  return instance;
};
