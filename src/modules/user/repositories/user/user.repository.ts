import { Injectable } from '@nestjs/common';

import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { User } from '@module/user/domain/user.entity';
import { UserMapper } from '@module/user/mappers/user.mapper';
import { IUserRepository } from '@module/user/repositories/user/user.repository.interface';

import { EntityId } from '@common/base/base.entity';
import { BaseRepository } from '@common/base/base.repository';

import { PrismaService } from '@shared/prisma/prisma.service';

@Injectable()
export class UserRepository
  extends BaseRepository<User>
  implements IUserRepository
{
  protected TABLE_NAME: string;

  constructor(
    @InjectTransactionHost()
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {
    super();
  }

  async insert(entity: User): Promise<User> {
    const raw = UserMapper.toPersistence(entity);

    await this.txHost.tx.userModel.create({
      data: raw,
    });

    return entity;
  }

  async findOneById(id: EntityId): Promise<User | undefined> {
    if (isNaN(Number(id))) {
      return;
    }

    const raw = await this.txHost.tx.userModel.findUnique({
      where: {
        id: UserMapper.toPrimaryKey(id),
      },
    });

    if (raw === null) {
      return;
    }

    return UserMapper.toEntity(raw);
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    const raw = await this.txHost.tx.userModel.findUnique({
      where: {
        username,
      },
    });

    if (raw === null) {
      return;
    }

    return UserMapper.toEntity(raw);
  }

  async update(entity: User): Promise<User> {
    const raw = UserMapper.toPersistence(entity);

    await this.txHost.tx.userModel.update({
      where: {
        id: raw.id,
      },
      data: raw,
    });

    return UserMapper.toEntity(raw);
  }

  async delete(entity: User): Promise<void> {
    await this.txHost.tx.userModel.delete({
      where: {
        id: UserMapper.toPrimaryKey(entity.id),
      },
    });
  }
}
