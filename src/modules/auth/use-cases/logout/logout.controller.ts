import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Response } from 'express';

import {
  AUTH_COOKIE_SERVICE,
  IAuthCookieService,
} from '@module/auth/services/auth-cookie.service.interface';

@ApiTags('auth')
@Controller()
export class LogoutController {
  constructor(
    @Inject(AUTH_COOKIE_SERVICE)
    private readonly authCookieService: IAuthCookieService,
  ) {}

  /**
   * @todo refresh token 저장소 도입 시 revoke/blacklist 처리 추가
   */
  @ApiOperation({ summary: '로그아웃 (인증 쿠키 제거)' })
  @ApiNoContentResponse({
    description: '인증 쿠키가 제거됩니다.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('auth/logout')
  logout(@Res({ passthrough: true }) res: Response): void {
    this.authCookieService.clear(res);
  }
}
