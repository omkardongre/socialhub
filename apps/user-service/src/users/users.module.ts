import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
