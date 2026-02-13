import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { StringValue } from 'ms';

import { AuthToken, AuthTokenType } from '@module/auth/entities/auth-token.vo';
import { AuthTokens } from '@module/auth/entities/auth-tokens.vo';
import { IAuthTokenService } from '@module/auth/services/auth-token/auth-token.service.interface';

/**
 * @todo 적절한 저장소를 통해 refresh token을 관리하세요.
 */
@Injectable()
export class AuthTokenService implements IAuthTokenService {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  createTokens(userId: string): AuthTokens {
    const accessToken = this.createToken(
      'access',
      userId,
      process.env.ACCESS_TOKEN_EXPIRES_IN as StringValue,
    );

    const refreshToken = this.createToken(
      'refresh',
      userId,
      process.env.REFRESH_TOKEN_EXPIRES_IN as StringValue,
    );

    return new AuthTokens({ accessToken, refreshToken });
  }

  private createToken(
    type: AuthTokenType,
    userId: string,
    expiresIn: StringValue,
  ): AuthToken {
    const token = this.jwtService.sign({ sub: userId }, { expiresIn });
    const decoded = this.jwtService.decode<{ exp: number }>(token);

    return new AuthToken({
      token,
      type,
      expiresAt: new Date(decoded.exp * 1000),
    });
  }
}
