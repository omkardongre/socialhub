import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthExceptionFilter } from './common/filters/http-exception.filter';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { env } from './env';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AuthExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(env.PORT);
}
bootstrap();
