import { Inject, Injectable } from '@nestjs/common';

import { UserMapper } from '@module/user/mappers/user.mapper';
import {
  IUserReadRepository,
  UserModel,
} from '@module/user/repositories/user.read-repository.interface';

import { EntityId } from '@common/base/base.entity';
import { BaseReadRepository } from '@common/base/base.read-repository';

import { PRISMA_SERVICE, PrismaService } from '@shared/prisma/prisma.service';

@Injectable()
export class UserReadRepository
  extends BaseReadRepository<UserModel>
  implements IUserReadRepository
{
  protected TABLE_NAME: string;

  constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prismaService: PrismaService,
  ) {
    super();
  }

  async findOneById(id: EntityId): Promise<UserModel | undefined> {
    if (isNaN(Number(id))) {
      return;
    }

    const raw = await this.prismaService.userSchema.findUnique({
      where: {
        id: UserMapper.toPrimaryKey(id),
      },
    });

    if (raw === null) {
      return;
    }

    return UserMapper.toModel(raw);
  }
}
