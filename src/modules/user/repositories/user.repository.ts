import { Injectable } from '@nestjs/common';

import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { User } from '@module/user/domain/user.entity';
import { UserMapper } from '@module/user/mappers/user.mapper';
import { IUserRepository } from '@module/user/repositories/user.repository.interface';

import { EntityId } from '@common/base/base.entity';
import { UniqueConstraintViolationError } from '@common/base/base.error';
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

    try {
      await this.txHost.tx.userModel.create({
        data: raw,
      });
    } catch (error) {
      if (this.isPrismaUniqueConstraintViolation(error)) {
        throw new UniqueConstraintViolationError(
          {
            modelName: 'UserModel',
            fields: this.parsePrismaUniqueTargetFields(error),
          },
          error,
        );
      }

      throw error;
    }

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

  private isPrismaUniqueConstraintViolation(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    return (
      'code' in error &&
      typeof error.code === 'string' &&
      error.code === 'P2002'
    );
  }

  private parsePrismaUniqueTargetFields(error: unknown): string[] | undefined {
    if (
      typeof error !== 'object' ||
      error === null ||
      !('meta' in error) ||
      typeof error.meta !== 'object' ||
      error.meta === null ||
      !('target' in error.meta)
    ) {
      return undefined;
    }

    const target = error.meta.target;

    if (!Array.isArray(target)) {
      return undefined;
    }

    return target.filter((field): field is string => typeof field === 'string');
  }
}
