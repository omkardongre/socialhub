import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { env } from './env';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enables automatic transformation
      transformOptions: {
        enableImplicitConversion: false, // Enables type conversion
      },
    }),
  );

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [env.RABBITMQ_URL],
      queue: env.RABBITMQ_QUEUE,
      queueOptions: {
        durable: true,
      },
      noAck: false,
      persistent: true,
    },
  });

  try {
    await app.startAllMicroservices();
    await app.listen(env.PORT);

    const url = await app.getUrl();
    console.log(`Notification Service is running on port ${env.PORT}`);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to start notification service:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

void bootstrap();
// added comment for testing5
