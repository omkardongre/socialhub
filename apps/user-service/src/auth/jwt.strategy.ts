import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { env } from '../env';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Request } from 'express';

// Custom extractor for JWT from cookie
const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['token'] || null;
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: env.JWT_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
