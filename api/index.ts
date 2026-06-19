import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { Express, Request, Response } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { BetterAuthConfigShape } from '../src/auth/auth.interface';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

type NodeHandlerFunction = (
  req: import('node:http').IncomingMessage,
  res: import('node:http').ServerResponse,
) => Promise<void>;

let cachedApp: Express;
let cachedBetterAuthHandler: NodeHandlerFunction;

export default async (req: Request, res: Response) => {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);

    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.setGlobalPrefix('api/v1');
    app.enableCors({
      origin: [process.env.LOCAL_ORIGIN, 'https://hoppscotch.io'],
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

    const authInstance = app.get<unknown>('BETTER_AUTH');
    const { toNodeHandler } = await import('better-auth/node');
    cachedBetterAuthHandler = toNodeHandler(
      authInstance as BetterAuthConfigShape,
    );

    cachedApp = app.getHttpAdapter().getInstance() as Express;
  }

  if (req.url.startsWith('/api/v1/auth')) {
    await cachedBetterAuthHandler(
      req as unknown as import('node:http').IncomingMessage,
      res as unknown as import('node:http').ServerResponse,
    );
    return;
  }

  if (cachedApp) {
    await cachedApp(req, res);
  }
};
