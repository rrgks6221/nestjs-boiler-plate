import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { StringValue } from 'ms';

import { AuthToken, AuthTokenType } from '@module/auth/entities/auth-token.vo';
import { AuthTokens } from '@module/auth/entities/auth-tokens.vo';
import { IAuthTokenService } from '@module/auth/services/auth-token.service.interface';

import { ENV_KEY } from '@common/factories/config-module.factory';

/**
 * @todo 적절한 저장소를 통해 refresh token을 관리하세요.
 * @todo logout 시 refresh token revoke(또는 rotation 체계) 처리도 함께 구현하세요.
 */
@Injectable()
export class AuthTokenService implements IAuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  createTokens(userId: string): AuthTokens {
    const accessToken = this.createToken(
      'access',
      userId,
      this.configService.getOrThrow<StringValue>(
        ENV_KEY.ACCESS_TOKEN_EXPIRES_IN,
      ),
    );

    const refreshToken = this.createToken(
      'refresh',
      userId,
      this.configService.getOrThrow<StringValue>(
        ENV_KEY.REFRESH_TOKEN_EXPIRES_IN,
      ),
    );

    return new AuthTokens({ accessToken, refreshToken });
  }

  private createToken(
    type: AuthTokenType,
    userId: string,
    expiresIn: StringValue,
  ): AuthToken {
    const token = this.jwtService.sign(
      {
        sub: userId,
        tokenType: type,
      },
      { expiresIn },
    );
    const decoded = this.jwtService.decode<{ exp: number }>(token);

    return new AuthToken({
      token,
      type,
      expiresAt: new Date(decoded.exp * 1000),
    });
  }
}
