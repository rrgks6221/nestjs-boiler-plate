import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Response } from 'express';

import { AuthTokens } from '@module/auth/entities/auth-tokens.vo';
import { SignInfoMismatchedError } from '@module/auth/errors/sign-info-mismatched.error';
import {
  AUTH_COOKIE_SERVICE,
  IAuthCookieService,
} from '@module/auth/services/auth-cookie/auth-cookie.service.interface';
import { SignInWithUsernameCommand } from '@module/auth/use-cases/sign-in-with-username/sign-in-with-username.command';
import { SignUpWithUsernameDto } from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.dto';

import { BaseHttpException } from '@common/base/base-http-exception';
import { RequestValidationError } from '@common/base/base.error';
import { ApiErrorResponse } from '@common/decorators/api-fail-response.decorator';

@ApiTags('auth')
@Controller()
export class SignInWithUsernameController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(AUTH_COOKIE_SERVICE)
    private readonly authCookieService: IAuthCookieService,
  ) {}

  @ApiOperation({ summary: 'username 기반 로그인' })
  @ApiCreatedResponse({
    headers: {
      'Set-Cookie': {
        description: 'access_token=token;refresh_token=token',
        schema: {
          type: 'string',
        },
      },
    },
  })
  @ApiErrorResponse({
    [HttpStatus.BAD_REQUEST]: [RequestValidationError],
    [HttpStatus.FORBIDDEN]: [SignInfoMismatchedError],
  })
  @Post('auth/sign-in/username')
  async signInWithUsername(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SignUpWithUsernameDto,
  ): Promise<void> {
    try {
      const tokens = await this.commandBus.execute<
        SignInWithUsernameCommand,
        AuthTokens
      >(
        new SignInWithUsernameCommand({
          username: dto.username,
          password: dto.password,
        }),
      );

      this.authCookieService.apply(res, tokens);
    } catch (error) {
      if (error instanceof SignInfoMismatchedError) {
        throw new BaseHttpException(HttpStatus.FORBIDDEN, error);
      }

      throw error;
    }
  }
}
