import { Module } from '@nestjs/common';
import { SendGridService } from './sendgrid.service';

@Module({
  imports: [],
  providers: [SendGridService],
  exports: [SendGridService],
})
export class SendGridModule {}
