import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserNotFoundError } from '@module/user/errors/user-not-found.error';
import {
  IUserReadRepository,
  USER_READ_REPOSITORY,
  UserModel,
} from '@module/user/repositories/user.read-repository.interface';
import { GetUserQuery } from '@module/user/use-cases/get-user/get-user.query';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, UserModel> {
  constructor(
    @Inject(USER_READ_REPOSITORY)
    private readonly userReadRepository: IUserReadRepository,
  ) {}

  async execute(query: GetUserQuery): Promise<UserModel> {
    const userModel = await this.userReadRepository.findOneById(query.userId);

    if (userModel === undefined) {
      throw new UserNotFoundError();
    }

    return userModel;
  }
}
