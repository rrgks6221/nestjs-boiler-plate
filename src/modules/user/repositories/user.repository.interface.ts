import { User } from '@module/user/domain/user.entity';

import { RepositoryPort } from '@common/base/base.repository';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository extends RepositoryPort<User> {
  findOneByUsername(username: string): Promise<User | undefined>;
}
