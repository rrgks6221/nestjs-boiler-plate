import { Inject, Injectable } from '@nestjs/common';

import { Prisma } from 'generated/prisma/client';

import { UserMapper } from '@module/user/mappers/user.mapper';
import {
  FindAllUsersOffsetPaginatedParams,
  IUserReadRepository,
  UserModel,
} from '@module/user/repositories/user.read-repository.interface';

import { EntityId } from '@common/base/base.entity';
import { OffsetPage } from '@common/base/base.model';
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

  async findAllOffsetPaginated(
    params: FindAllUsersOffsetPaginatedParams,
  ): Promise<OffsetPage<UserModel>> {
    const { pageInfo, order = [], filter = {} } = params;

    const where: Prisma.UserSchemaWhereInput = {};

    if (filter.username) {
      where.username = {
        contains: filter.username,
      };
    }

    const [rawRows, totalCount] = await Promise.all([
      this.prismaService.userSchema.findMany({
        skip: pageInfo.offset,
        take: pageInfo.limit,
        where,
        orderBy: this.toOrderBy(order),
      }),
      this.prismaService.userSchema.count({ where }),
    ]);

    const perPage = pageInfo.limit;
    const currentPage = Math.floor(pageInfo.offset / perPage) + 1;

    return new OffsetPage(
      rawRows.map((raw) => UserMapper.toModel(raw)),
      currentPage,
      perPage,
      totalCount,
    );
  }
}
