import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';

import { BaseHttpException } from '@common/base/base-http-exception';
import { UnauthorizedError } from '@common/base/base.error';

export const Public = () => SetMetadata('isPublic', true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(Reflector)
    private readonly reflector: Reflector,
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
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return request.cookies.access_token;
  }
}
