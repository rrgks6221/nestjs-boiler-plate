import { BaseQuery } from '@common/base/base.query';
import { ISort } from '@common/base/base.read-repository';

export interface ListUsersQueryProps {
  page: number;
  perPage: number;
  username?: string;
  order?: ISort<'id' | 'createdAt'>[];
}

export class ListUsersQuery extends BaseQuery {
  readonly page: number;
  readonly perPage: number;
  readonly username?: string;
  readonly order?: ISort<'id' | 'createdAt'>[];

  constructor(props: ListUsersQueryProps) {
    super();

    this.page = props.page;
    this.perPage = props.perPage;
    this.username = props.username;
    this.order = props.order;
  }
}
