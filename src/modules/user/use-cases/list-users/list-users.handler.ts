import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  IUserReadRepository,
  USER_READ_REPOSITORY,
  UserModel,
} from '@module/user/repositories/user.read-repository.interface';
import { ListUsersQuery } from '@module/user/use-cases/list-users/list-users.query';

import { OffsetPage } from '@common/base/base.model';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<
  ListUsersQuery,
  OffsetPage<UserModel>
> {
  constructor(
    @Inject(USER_READ_REPOSITORY)
    private readonly userReadRepository: IUserReadRepository,
  ) {}

  async execute(query: ListUsersQuery): Promise<OffsetPage<UserModel>> {
    return await this.userReadRepository.findAllOffsetPaginated({
      pageInfo: {
        offset: (query.page - 1) * query.perPage,
        limit: query.perPage,
      },
      order: query.order,
      filter: {
        username: query.username,
      },
    });
  }
}
