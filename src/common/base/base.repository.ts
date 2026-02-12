import { BaseEntity, EntityId } from '@common/base/base.entity';

export interface ISort<Field extends string = string> {
  field: Field;
  direction: 'desc' | 'asc';
}

export interface RepositoryPort<E> {
  insert(entity: E): Promise<E>;

  findOneById(id: EntityId): Promise<E | undefined>;

  update(entity: E): Promise<E>;

  delete(entity: E): Promise<void>;
}

export abstract class BaseRepository<
  Entity extends BaseEntity<unknown>,
> implements RepositoryPort<Entity> {
  protected abstract TABLE_NAME: string;

  abstract insert(entity: Entity): Promise<Entity>;

  abstract findOneById(id: EntityId): Promise<Entity | undefined>;

  abstract update(entity: Entity): Promise<Entity>;

  abstract delete(entity: Entity): Promise<void>;

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
