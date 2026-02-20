import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { User } from '@module/user/domain/user.entity';
import { UserNotFoundError } from '@module/user/errors/user-not-found.error';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@module/user/repositories/user.repository.interface';
import { GetUserQuery } from '@module/user/use-cases/get-user/get-user.query';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, User> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserQuery): Promise<User> {
    const user = await this.userRepository.findOneById(query.userId);

    if (user === undefined) {
      throw new UserNotFoundError();
    }

    return user;
  }
}
