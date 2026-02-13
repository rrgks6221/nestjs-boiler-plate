import { Inject, Injectable } from '@nestjs/common';

import { User } from '@module/user/domain/user.entity';
import { UserNotFoundError } from '@module/user/errors/user-not-found.error';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@module/user/repositories/user/user.repository.interface';
import { GetUserByUsernameQuery } from '@module/user/use-cases/get-user-by-username/get-user-by-username.query';

import { IQueryHandler } from '@common/interfaces/query.interface';

@Injectable()
export class GetUserByUsernameHandler implements IQueryHandler<
  GetUserByUsernameQuery,
  User
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserByUsernameQuery): Promise<User> {
    const user = await this.userRepository.findOneByUsername(query.username);

    if (user === undefined) {
      throw new UserNotFoundError();
    }

    return user;
  }
}
