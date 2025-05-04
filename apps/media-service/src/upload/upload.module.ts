import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [MulterModule.register(), PrismaModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
