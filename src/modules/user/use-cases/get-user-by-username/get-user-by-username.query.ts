import { BaseQuery } from '@common/base/base.query';

export interface GetUserByUsernameQueryProps {
  username: string;
}

export class GetUserByUsernameQuery extends BaseQuery {
  readonly username: string;

  constructor(props: GetUserByUsernameQueryProps) {
    super();

    this.username = props.username;
  }
}
