import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import { SignInType, User, UserProps } from '@module/user/domain/user.entity';

import { BaseEntityProps, generateEntityId } from '@common/base/base.entity';

type UserFactoryAttributes = UserProps & BaseEntityProps;

export const UserFactory = Factory.define<
  User,
  void,
  User,
  Partial<UserFactoryAttributes>
>(({ params }) => {
  const defaultAttributes: UserFactoryAttributes = {
    id: generateEntityId(),
    signInType: faker.helpers.enumValue(SignInType),
    username: faker.string.nanoid(10),
    password: faker.internet.password(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const attributes = Object.assign(defaultAttributes, params);

  const { id, createdAt, updatedAt, ...props } = attributes;

  return new User({ id, createdAt, updatedAt, props });
});
