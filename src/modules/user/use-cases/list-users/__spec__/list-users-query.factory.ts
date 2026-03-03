import { Factory } from 'fishery';

import {
  ListUsersQuery,
  ListUsersQueryProps,
} from '@module/user/use-cases/list-users/list-users.query';

export const ListUsersQueryFactory = Factory.define<
  ListUsersQuery,
  void,
  ListUsersQuery,
  Partial<ListUsersQueryProps>
>(({ params }) => {
  const defaultAttributes: ListUsersQueryProps = {
    page: 0,
    perPage: 20,
  };
  const attributes = Object.assign(defaultAttributes, params);

  return new ListUsersQuery(attributes);
});
