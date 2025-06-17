import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ChatExceptionFilter } from './common/filters/http-exception.filter';
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
      transform: true,
    }),
  );
  app.useGlobalFilters(new ChatExceptionFilter());

  await app.listen(env.PORT);
  console.log(`Chat Service is running on port ${env.PORT}`);
}
bootstrap();
