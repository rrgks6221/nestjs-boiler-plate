import { Injectable } from '@nestjs/common';

import { Response } from 'express';

import { AuthTokens } from '@module/auth/entities/auth-tokens.vo';
import { IAuthCookieService } from '@module/auth/services/auth-cookie/auth-cookie.service.interface';

@Injectable()
export class AuthCookieService implements IAuthCookieService {
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

  private accessOptions(expiresAt: Date) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
      expires: expiresAt,
    };
  }

  private refreshOptions(expiresAt: Date) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/auth',
      expires: expiresAt,
    };
  }
}
