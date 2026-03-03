import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserCollectionDtoAssembler } from '@module/user/assemblers/user-collection-dto.assembler';
import { UserDtoAssembler } from '@module/user/assemblers/user-dto.assembler';
import { ListUsersOffsetPageDto } from '@module/user/dto/user-offset-page.dto';
import { UserModel } from '@module/user/repositories/user.read-repository.interface';
import { ListUsersQuery } from '@module/user/use-cases/list-users/list-users.query';
import { ListUsersRequestQueryDto } from '@module/user/use-cases/list-users/list-users.request-query.dto';

import { RequestValidationError } from '@common/base/base.error';
import { OffsetPage } from '@common/base/base.model';
import { ApiErrorResponse } from '@common/decorators/api-fail-response.decorator';

@ApiTags('user')
@Controller()
export class ListUsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: '유저 목록 조회 (offset pagination)' })
  @ApiOkResponse({ type: ListUsersOffsetPageDto })
  @ApiErrorResponse({
    [HttpStatus.BAD_REQUEST]: [RequestValidationError],
  })
  @Get('users')
  async listUsersOffsetPage(
    @Query() queryDto: ListUsersRequestQueryDto,
  ): Promise<ListUsersOffsetPageDto> {
    const page = await this.queryBus.execute<
      ListUsersQuery,
      OffsetPage<UserModel>
    >(
      new ListUsersQuery({
        page: queryDto.page,
        perPage: queryDto.perPage,
        username: queryDto.username,
        order: queryDto.order,
      }),
    );

    return UserCollectionDtoAssembler.convertToOffsetPageDto(page);
  }
}
