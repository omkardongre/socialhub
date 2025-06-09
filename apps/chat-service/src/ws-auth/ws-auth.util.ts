import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import * as cookie from 'cookie';

export async function verifyWsClientToken(
  client: any,
  jwtService: JwtService,
  configService: ConfigService,
) {
  const token = extractTokenFromClient(client);

  if (!token) {
    throw new WsException('No token provided');
  }

  try {
    const payload = await jwtService.verifyAsync(token, {
      secret: configService.get<string>('JWT_SECRET'),
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
