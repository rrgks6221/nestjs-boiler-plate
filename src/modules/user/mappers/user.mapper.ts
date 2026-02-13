import { UserModel } from 'generated/prisma/browser';

import { SignInType, User } from '@module/user/domain/user.entity';

import { BaseMapper } from '@common/base/base.mapper';

export class UserMapper extends BaseMapper {
  // implements IBaseMapper<User, UserRaw>
  static toEntity(raw: UserModel): User {
    return new User({
      id: this.toEntityId(raw.id),
      props: {
        signInType: SignInType[raw.signInType],
        username: raw.username,
        password: raw.password,
      },
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(entity: User): UserModel {
    return {
      id: this.toPrimaryKey(entity.id),
      signInType: entity.signInType,
      username: entity.username,
      password: entity.password,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
