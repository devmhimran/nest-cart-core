import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { auth } from './auth/auth.config';
import { toNodeHandler } from 'better-auth/node';
import type { IncomingMessage, ServerResponse } from 'node:http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger(),
  });

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5000',
      'https://hoppscotch.io',
    ],
    credentials: true,
  });

  // 3. ⚡ LOCAL FAST PATH: Intercept Better Auth calls in NestJS dev server
  app.use('/api/v1/auth', (req, res) => {
    return toNodeHandler(auth)(
      req as unknown as IncomingMessage,
      res as unknown as ServerResponse,
    );
  });

  // Global settings
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Nest Cart Core')
    .setDescription('Documentation for Nest Nexus API')
    .setVersion('1.0')
    .addTag('nest-nexus')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/v1/docs', app, documentFactory, {
    customSiteTitle: 'Nest Nexus API Docs',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap().catch((err) => {
  console.error('💥 Error during bootstrap:', err);
});
