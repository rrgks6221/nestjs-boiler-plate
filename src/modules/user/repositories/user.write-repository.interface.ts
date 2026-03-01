import { User } from '@module/user/domain/user.entity';

import { IWriteRepository } from '@common/base/base.write-repository';

export const USER_WRITE_REPOSITORY = Symbol('USER_WRITE_REPOSITORY');

export interface IUserWriteRepository extends IWriteRepository<User> {
  findOneByUsername(username: string): Promise<User | undefined>;
}
