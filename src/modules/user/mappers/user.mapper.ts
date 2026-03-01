import { UserSchema } from 'generated/prisma/browser';

import { SignInType, User } from '@module/user/domain/user.entity';
import { UserModel } from '@module/user/repositories/user.read-repository.interface';

import { BaseMapper } from '@common/base/base.mapper';

export class UserMapper extends BaseMapper {
  static toEntity(raw: UserSchema): User {
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

  static toModel(raw: UserSchema): UserModel {
    return {
      id: this.toEntityId(raw.id),
      signInType: SignInType[raw.signInType],
      username: raw.username,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toPersistence(entity: User): UserSchema {
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
