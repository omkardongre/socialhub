import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FollowersModule } from './followers/followers.module';
import { ProfilesModule } from './profiles/profiles.module';
import { PrismaService } from './prisma/prisma.service';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [UsersModule, ProfilesModule, FollowersModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtStrategy],
})
export class AppModule {}
