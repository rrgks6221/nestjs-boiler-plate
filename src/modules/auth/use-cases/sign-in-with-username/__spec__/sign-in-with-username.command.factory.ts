import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import {
  SignInWithUsernameCommand,
  SignInWithUsernameCommandProps,
} from '@module/auth/use-cases/sign-in-with-username/sign-in-with-username.command';

export const SignInWithUsernameCommandFactory = Factory.define<
  SignInWithUsernameCommand,
  void,
  SignInWithUsernameCommand,
  Partial<SignInWithUsernameCommandProps>
>(({ params }) => {
  const defaultAttributes: SignInWithUsernameCommandProps = {
    username: faker.string.nanoid(10),
    password: faker.internet.password(),
  };
  const attributes = Object.assign(defaultAttributes, params);

  return new SignInWithUsernameCommand(attributes);
});
