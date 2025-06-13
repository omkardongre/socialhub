import { Module } from '@nestjs/common';
import { env } from '../env';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRES_IN || '10d' },
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
