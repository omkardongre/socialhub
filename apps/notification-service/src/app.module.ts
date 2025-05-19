import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventBusModule } from '@app/event-bus';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [EventBusModule, NotificationsModule, ClientsModule.register([])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
