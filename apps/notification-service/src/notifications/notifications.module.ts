import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationProcessor } from './notification.processor';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SendGridModule } from '../sendgrid/sendgrid.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    SendGridModule,
    BullModule.registerQueueAsync({
      name: 'notification-queue',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', process.env.REDIS_HOST),
          port: configService.get('REDIS_PORT', Number(process.env.REDIS_PORT)),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
