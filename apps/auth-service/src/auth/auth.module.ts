import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserRestService } from '../external/user/user.rest.service';
import { HttpModule } from '@nestjs/axios';
import { NotificationRestService } from '../external/notification/notification.rest.service';
import { SendGridModule } from '../sendgrid/sendgrid.module';
import { env } from '../env';

@Module({
  imports: [
    HttpModule,
    PrismaModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRES_IN },
    }),
    SendGridModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UserRestService,
    NotificationRestService,
  ],
})
export class AuthModule {}
