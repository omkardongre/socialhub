import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationProcessor } from './notification.processor';
import { env } from '../env';
import { SendGridModule } from '../sendgrid/sendgrid.module';

@Module({
  imports: [
    PrismaModule,
    SendGridModule,
    BullModule.registerQueue({
      name: 'notification-queue',
      redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
