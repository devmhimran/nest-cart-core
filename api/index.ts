import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Express, Request, Response } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

let cachedApp: Express;

export default async (req: Request, res: Response) => {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix('api/v1');
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
    });

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

    await app.init();

    cachedApp = app.getHttpAdapter().getInstance() as Express;
  }
  if (cachedApp) {
    await cachedApp(req, res);
  }
};
