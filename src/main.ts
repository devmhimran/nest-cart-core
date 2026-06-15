import 'dotenv/config';
import { AppModule } from './app.module';
import { auth } from './auth/auth.config';
import { NestFactory } from '@nestjs/core';
import { toNodeHandler } from 'better-auth/node';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger(),
  });

  app.enableCors({
    origin: [process.env.LOCAL_ORIGIN, 'https://hoppscotch.io'],
    credentials: true,
  });

  app.use('/api/v1/auth', (req, res) => {
    return toNodeHandler(auth)(
      req as unknown as IncomingMessage,
      res as unknown as ServerResponse,
    );
  });

  // Global settings
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
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
