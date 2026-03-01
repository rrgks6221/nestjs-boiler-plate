import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@module/auth-security/guards/jwt-auth.guard';
import { UserDtoAssembler } from '@module/user/assemblers/user-dto.assembler';
import { UserDto } from '@module/user/dto/user.dto';
import { UserNotFoundError } from '@module/user/errors/user-not-found.error';
import { UserModel } from '@module/user/repositories/user.read-repository.interface';
import { GetUserQuery } from '@module/user/use-cases/get-user/get-user.query';

import { BaseHttpException } from '@common/base/base-http-exception';
import { UnauthorizedError } from '@common/base/base.error';
import { ApiErrorResponse } from '@common/decorators/api-fail-response.decorator';
import {
  CurrentUser,
  ICurrentUser,
} from '@common/decorators/current-user.decorator';

@ApiTags('user')
@Controller()
export class GetUserController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: '내 정보 조회' })
  @ApiCookieAuth('cookie-auth')
  @ApiOkResponse({ type: UserDto })
  @ApiErrorResponse({
    [HttpStatus.UNAUTHORIZED]: [UnauthorizedError],
    [HttpStatus.INTERNAL_SERVER_ERROR]: [UserNotFoundError],
  })
  @UseGuards(JwtAuthGuard)
  @Get('users/me')
  async getMe(@CurrentUser() currentUser: ICurrentUser): Promise<UserDto> {
    try {
      const userModel = await this.queryBus.execute<GetUserQuery, UserModel>(
        new GetUserQuery({ userId: currentUser.id }),
      );

      return UserDtoAssembler.convertToDto(userModel);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new BaseHttpException(HttpStatus.INTERNAL_SERVER_ERROR, error);
      }

      throw error;
    }
  }
}
