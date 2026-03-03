import { SignInType } from '@module/user/domain/user.entity';

import { OffsetPage } from '@common/base/base.model';
import {
  IOffsetPageInfoParam,
  IReadRepository,
  ISort,
} from '@common/base/base.read-repository';

export const USER_READ_REPOSITORY = Symbol('USER_READ_REPOSITORY');

export const USER_ORDER_FIELDS = ['id', 'createdAt'] as const;

export type UserOrderField = (typeof USER_ORDER_FIELDS)[number];

export interface UserModel {
  readonly id: string;
  readonly signInType: SignInType;
  readonly username: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UserPageItemModel {
  readonly id: string;
  readonly signInType: SignInType;
  readonly username: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface FindAllUsersOffsetPaginatedParams {
  pageInfo: IOffsetPageInfoParam;
  order?: ISort<UserOrderField>[];
  filter?: {
    username?: string;
  };
}

export interface IUserReadRepository extends IReadRepository<UserModel> {
  findAllOffsetPaginated(
    params: FindAllUsersOffsetPaginatedParams,
  ): Promise<OffsetPage<UserPageItemModel>>;
}
