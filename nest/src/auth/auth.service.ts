import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual } from 'crypto';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

export interface TokenPayload {
  sub: string;
  username: string;
}

export const PILOT_ID = 'pilot_johndoe';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login({ username, password }: LoginDto): Promise<LoginResponseDto> {
    const expectedUser = this.config.get<string>('PILOT_USERNAME') ?? 'johndoe';
    const expectedPass = this.config.get<string>('PILOT_PASSWORD') ?? 'susiairtest';

    // Compare both fields every time so the response time doesn't reveal which one was wrong.
    const userOk = safeEqual(username, expectedUser);
    const passOk = safeEqual(password, expectedPass);
    if (!userOk || !passOk) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Incorrect username or password.',
      });
    }

    const payload: TokenPayload = { sub: PILOT_ID, username: expectedUser };
    return {
      accessToken: await this.jwt.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '12h',
    };
  }

  async verify(token: string): Promise<TokenPayload> {
    return this.jwt.verifyAsync<TokenPayload>(token);
  }
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
