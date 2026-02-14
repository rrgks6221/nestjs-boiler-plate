import { BaseQuery } from '@common/base/base.query';

export interface GetUserQueryProps {
  userId: string;
}

export class GetUserQuery extends BaseQuery {
  readonly userId: string;

  constructor(props: GetUserQueryProps) {
    super();

    this.userId = props.userId;
  }
}
