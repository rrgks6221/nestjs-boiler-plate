import { AggregateRoot, BaseEntity, EntityId } from '@common/base/base.entity';

export interface IWriteRepository<E> {
  insert(entity: E): Promise<E>;

  findOneById(id: EntityId): Promise<E | undefined>;

  update(entity: E): Promise<E>;

  delete(entity: E): Promise<void>;
}

export abstract class BaseWriteRepository<
  Entity extends BaseEntity<unknown> | AggregateRoot<unknown>,
> implements IWriteRepository<Entity> {
  protected abstract TABLE_NAME: string;

  abstract insert(entity: Entity): Promise<Entity>;

  abstract findOneById(id: EntityId): Promise<Entity | undefined>;

  abstract update(entity: Entity): Promise<Entity>;

  abstract delete(entity: Entity): Promise<void>;
}
