import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import {
  CreateUserWithUsernameCommand,
  CreateUserWithUsernameCommandProps,
} from '@module/user/use-cases/create-user-with-username/create-user-with-username.command';

export const CreateUserWithUsernameCommandFactory = Factory.define<
  CreateUserWithUsernameCommand,
  void,
  CreateUserWithUsernameCommand,
  Partial<CreateUserWithUsernameCommandProps>
>(({ params }) => {
  const defaultAttributes: CreateUserWithUsernameCommandProps = {
    username: faker.string.nanoid(10),
    password: faker.internet.password(),
  };
  const attributes = Object.assign(defaultAttributes, params);

  return new CreateUserWithUsernameCommand(attributes);
});
