import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';
import { ClsService } from 'nestjs-cls';

import { AuthTokenType } from '@module/auth/entities/auth-token.vo';

import { BaseHttpException } from '@common/base/base-http-exception';
import { UnauthorizedError } from '@common/base/base.error';
import { CLS_STORE_KEY } from '@common/constants/cls-store-key.constant';

export const Public = () => SetMetadata('isPublic', true);

interface AccessTokenPayload {
  sub: string;
  tokenType: AuthTokenType;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly clsService: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new BaseHttpException(
        HttpStatus.UNAUTHORIZED,
        new UnauthorizedError(),
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      if (payload.tokenType !== 'access') {
        throw new BaseHttpException(
          HttpStatus.UNAUTHORIZED,
          new UnauthorizedError(),
        );
      }

      this.clsService.set(CLS_STORE_KEY.ACTOR_ID, payload.sub);
      request['user'] = {
        id: payload.sub,
      };
    } catch {
      throw new BaseHttpException(
        HttpStatus.UNAUTHORIZED,
        new UnauthorizedError(),
      );
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return request.cookies.access_token;
  }
}
