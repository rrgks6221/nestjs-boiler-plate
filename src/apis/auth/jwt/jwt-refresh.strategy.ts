import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JWT_TOKEN_TYPE } from '@src/apis/auth/constants/auth.constant';
import { Payload } from '@src/apis/auth/types/auth.type';
import { UserEntity } from '@src/apis/users/entities/user.entity';
import { UsersService } from '@src/apis/users/services/users.service';
import { ERROR_CODE } from '@src/constants/error-response-code.constant';
import { ENV_KEY } from '@src/core/app-config/constants/app-config.constant';
import { AppConfigService } from '@src/core/app-config/services/app-config.service';
import { HttpExceptionHelper } from '@src/core/http-exception-filters/helpers/http-exception.helper';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    appConfigService: AppConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshStrategy.extractJWT,
      ]),
      ignoreExpiration: false,
      secretOrKey: appConfigService.get<string>(
        ENV_KEY.JWT_REFRESH_TOKEN_SECRET,
      ),
    });
  }

  async validate(payload: Payload) {
    const existUser: UserEntity | null = await this.usersService.findOneBy({
      id: payload.id,
    });

    if (!existUser) {
      throw new UnauthorizedException(
        HttpExceptionHelper.createError({
          code: ERROR_CODE.CODE004,
          message: 'this token is invalid',
        }),
      );
    }

    return new UserEntity(existUser);
  }

  private static extractJWT(req: Request): string | null {
    const token = req.cookies?.refresh_token;

    if (!token) {
      throw new UnauthorizedException(
        HttpExceptionHelper.createError({
          code: ERROR_CODE.CODE004,
          message: 'this token is invalid',
        }),
      );
    }

    const [type, refreshToken] = token.split(' ');

    if (type !== JWT_TOKEN_TYPE) {
      throw new UnauthorizedException(
        HttpExceptionHelper.createError({
          code: ERROR_CODE.CODE004,
          message: 'this token is invalid',
        }),
      );
    }

    if (!refreshToken) {
      throw new UnauthorizedException(
        HttpExceptionHelper.createError({
          code: ERROR_CODE.CODE004,
          message: 'this token is invalid',
        }),
      );
    }

    return refreshToken;
  }
}
