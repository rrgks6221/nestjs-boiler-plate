import { SignInType } from '@module/user/domain/user.entity';

import { IReadRepository } from '@common/base/base.read-repository';

export const USER_READ_REPOSITORY = Symbol('USER_READ_REPOSITORY');

export interface UserModel {
  readonly id: string;
  readonly signInType: SignInType;
  readonly username: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUserReadRepository extends IReadRepository<UserModel> {}
