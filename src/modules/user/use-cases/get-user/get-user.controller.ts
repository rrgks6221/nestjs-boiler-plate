import { Controller, Get, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@module/auth/guard/jwt-auth.guard';
import { UserDtoAssembler } from '@module/user/assemblers/user-dto.assembler';
import { User } from '@module/user/domain/user.entity';
import { UserNotFoundError } from '@module/user/errors/user-not-found.error';
import { GetUserQuery } from '@module/user/use-cases/get-user/get-user.query';

import { BaseHttpException } from '@common/base/base-http-exception';
import {
  CurrentUser,
  ICurrentUser,
} from '@common/decorators/current-user.decorator';

@ApiTags('user')
@Controller()
export class GetUserController {
  constructor(
    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiOkResponse()
  @Get('users/me')
  async getMe(@CurrentUser() currentUser: ICurrentUser) {
    try {
      const user = await this.queryBus.execute<GetUserQuery, User>(
        new GetUserQuery({ userId: currentUser.id }),
      );

      return UserDtoAssembler.convertToDto(user);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new BaseHttpException(HttpStatus.NOT_FOUND, error);
      }

      throw error;
    }
  }
}
