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
import {
  AUTH_COOKIE_SERVICE,
  IAuthCookieService,
} from '@module/auth/services/auth-cookie/auth-cookie.service.interface';
import { SignUpWithUsernameCommand } from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.command';
import { SignUpWithUsernameDto } from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.dto';
import { UserUsernameAlreadyOccupiedError } from '@module/user/errors/user-username-already-occupied.error';

import { BaseHttpException } from '@common/base/base-http-exception';

@ApiTags('auth')
@Controller()
export class SignUpWithUsernameController {
  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,
    @Inject(AUTH_COOKIE_SERVICE)
    private readonly authCookieService: IAuthCookieService,
  ) {}

  @ApiOperation({ summary: 'username 기반 회원가입' })
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
  @Post('auth/sign-up/username')
  async signUpWithUsername(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SignUpWithUsernameDto,
  ): Promise<void> {
    try {
      const tokens = await this.commandBus.execute<
        SignUpWithUsernameCommand,
        AuthTokens
      >(
        new SignUpWithUsernameCommand({
          username: dto.username,
          password: dto.password,
        }),
      );

      this.authCookieService.apply(res, tokens);
    } catch (error) {
      if (error instanceof UserUsernameAlreadyOccupiedError) {
        throw new BaseHttpException(HttpStatus.CONFLICT, error);
      }

      throw error;
    }
  }
}
