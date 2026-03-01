import { EntityId } from '@common/base/base.entity';

export abstract class BaseMapper {
  static toPrimaryKey(id: string): bigint {
    return BigInt(id);
  }

  static toEntityId(rawId: bigint): EntityId {
    return rawId.toString();
  }
}
