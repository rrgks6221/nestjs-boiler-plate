import { Factory } from 'fishery';

import {
  GetUserQuery,
  GetUserQueryProps,
} from '@module/user/use-cases/get-user/get-user.query';

import { generateEntityId } from '@common/base/base.entity';

export const GetUserQueryFactory = Factory.define<
  GetUserQuery,
  void,
  GetUserQuery,
  Partial<GetUserQueryProps>
>(({ params }) => {
  const defaultAttributes: GetUserQueryProps = {
    userId: generateEntityId(),
  };
  const attributes = Object.assign(defaultAttributes, params);

  return new GetUserQuery(attributes);
});
