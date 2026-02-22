import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Response } from 'express';

import { AuthTokens } from '@module/auth/entities/auth-tokens.vo';
import { IAuthCookieService } from '@module/auth/services/auth-cookie.service.interface';

import { ENV_KEY } from '@common/factories/config-module.factory';

@Injectable()
export class AuthCookieService implements IAuthCookieService {
  constructor(private readonly configService: ConfigService) {}

  apply(res: Response, tokens: AuthTokens): void {
    res.cookie(
      'access_token',
      tokens.accessToken.token,
      this.accessOptions(tokens.accessToken.expiresAt),
    );
    res.cookie(
      'refresh_token',
      tokens.refreshToken.token,
      this.refreshOptions(tokens.refreshToken.expiresAt),
    );
  }

  clear(res: Response): void {
    res.clearCookie('access_token', this.accessOptions(new Date(0)));
    res.clearCookie('refresh_token', this.refreshOptions(new Date(0)));
  }

  private accessOptions(expiresAt: Date) {
    return {
      httpOnly: true,
      secure: this.isSecureCookie(),
      sameSite: 'lax' as const,
      path: '/',
      expires: expiresAt,
    };
  }

  private refreshOptions(expiresAt: Date) {
    return {
      httpOnly: true,
      secure: this.isSecureCookie(),
      sameSite: 'lax' as const,
      path: '/auth',
      expires: expiresAt,
    };
  }

  private isSecureCookie(): boolean {
    return this.configService.get<string>(ENV_KEY.NODE_ENV) === 'production';
  }
}
