import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import * as cookie from 'cookie';
import { env } from '../env';

export async function verifyWsClientToken(client: any, jwtService: JwtService) {
  const token = extractTokenFromClient(client);

  if (!token) {
    throw new WsException('No token provided');
  }

  try {
    const payload = await jwtService.verifyAsync(token, {
      secret: env.JWT_SECRET,
    });

    return payload;
  } catch (err) {
    throw new WsException('Invalid or expired token');
  }
}

function extractTokenFromClient(client: any): string | null {
  const cookieHeader = client.handshake.headers.cookie;
  const cookies = cookie.parse(cookieHeader || '');
  const token = cookies.token;

  return token;
}
