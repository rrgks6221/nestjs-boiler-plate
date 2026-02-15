import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import {
  GetUserByUsernameQuery,
  GetUserByUsernameQueryProps,
} from '@module/user/use-cases/get-user-by-username/get-user-by-username.query';

export const GetUserByUsernameQueryFactory = Factory.define<
  GetUserByUsernameQuery,
  void,
  GetUserByUsernameQuery,
  Partial<GetUserByUsernameQueryProps>
>(({ params }) => {
  const defaultAttributes: GetUserByUsernameQueryProps = {
    username: faker.string.nanoid(10),
  };
  const attributes = Object.assign(defaultAttributes, params);

  return new GetUserByUsernameQuery(attributes);
});
