import { EntityId } from '@common/base/base.entity';

export interface ISort<Field extends string = string> {
  field: Field;
  direction: 'desc' | 'asc';
}

export interface IReadRepository<M> {
  findOneById(id: EntityId): Promise<M | undefined>;
}

export abstract class BaseReadRepository<
  Model,
> implements IReadRepository<Model> {
  protected abstract TABLE_NAME: string;

  abstract findOneById(id: EntityId): Promise<Model | undefined>;

  protected toOrderBy(sort?: ISort[]): Record<string, any> | undefined {
    if (sort === undefined || sort.length === 0) {
      return;
    }

    return sort.map(({ field, direction }) => {
      return {
        [field]: direction,
      };
    });
  }
}
