import { BaseEntity, EntityId } from '@common/base/base.entity';

export abstract class BaseMapper {
  static toPrimaryKey(id: string): bigint {
    return BigInt(id);
  }

  static toEntityId(rawId: bigint): EntityId {
    return rawId.toString();
  }
}

export interface IBaseMapper<
  Entity extends BaseEntity<unknown>,
  Raw extends { id: bigint },
> extends BaseMapper {
  toEntity(record: Raw): Entity;

  toPersistence(entity: Entity): Raw;

  toPrimaryKey(id: EntityId): bigint;

  toEntityId(rawId: bigint): EntityId;
}
