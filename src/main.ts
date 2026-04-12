import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger(),
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Nest Nexus')
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

  // if (process.env.RUNTIME !== 'serverless') {
  //   const port = process.env.PORT ?? 5000;
  //   await app.listen(port);
  //   console.log(`🚀 Server running on http://localhost:${port}/api/v1`);
  // }
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
