import { BaseQuery } from '@common/base/base.query';

export interface IQueryHandler<TQuery extends BaseQuery, TResult> {
  execute(query: TQuery): Promise<TResult>;
}
