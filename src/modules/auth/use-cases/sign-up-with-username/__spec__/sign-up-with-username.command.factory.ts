import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import {
  SignUpWithUsernameCommand,
  SignUpWithUsernameCommandProps,
} from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.command';

export const SignUpWithUsernameCommandFactory = Factory.define<
  SignUpWithUsernameCommand,
  void,
  SignUpWithUsernameCommand,
  Partial<SignUpWithUsernameCommandProps>
>(({ params }) => {
  const defaultAttributes: SignUpWithUsernameCommandProps = {
    username: faker.string.nanoid(10),
    password: faker.internet.password(),
  };
  const attributes = Object.assign(defaultAttributes, params);

  return new SignUpWithUsernameCommand(attributes);
});
