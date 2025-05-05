import { Module } from '@nestjs/common';
import { PostAssociationController } from './post-association.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostAssociationController],
})
export class PostAssociationModule {}
