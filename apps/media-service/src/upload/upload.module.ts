import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PostAssociationModule } from '../post-association/post-association.module';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, PostAssociationModule, HttpModule, AuthModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
