import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: {
        statusCode: 429,
        message: 'Too many requests from this IP, please try again later.',
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Farmers API')
    .setDescription(
      'API para listar, criar, editar e excluir proprietários rurais',
    )
    .setVersion('1.0')
    .addTag('farmers', 'Endpoints dos propriedades')
    .addTag('properties', 'Endpoints das propriedades rurais')
    .addTag(
      'harvests',
      'Endpoints das safras (ano) relacionadas as propriedades',
    )
    .addTag('crops', 'Endpoints das culturas relacionadas as safras')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
