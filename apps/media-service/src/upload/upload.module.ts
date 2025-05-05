import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from '../prisma/prisma.module';
import { PostAssociationModule } from '../post-association/post-association.module';

@Module({
  imports: [MulterModule.register(), PrismaModule, PostAssociationModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
