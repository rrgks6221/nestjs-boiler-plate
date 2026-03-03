import { Test, TestingModule } from '@nestjs/testing';

import { UserFactory } from '@module/user/domain/__spec__/user.entity.factory';
import { SignInType } from '@module/user/domain/user.entity';
import { User } from '@module/user/domain/user.entity';
import { UserReadRepository } from '@module/user/repositories/user.read-repository';
import {
  IUserReadRepository,
  USER_READ_REPOSITORY,
} from '@module/user/repositories/user.read-repository.interface';
import { UserWriteRepository } from '@module/user/repositories/user.write-repository';
import {
  IUserWriteRepository,
  USER_WRITE_REPOSITORY,
} from '@module/user/repositories/user.write-repository.interface';

import { generateEntityId } from '@common/base/base.entity';
import { ClsModuleFactory } from '@common/factories/cls-module.factory';

describe(UserReadRepository.name, () => {
  let writeRepository: IUserWriteRepository;
  let readRepository: IUserReadRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ClsModuleFactory()],
      providers: [
        {
          provide: USER_WRITE_REPOSITORY,
          useClass: UserWriteRepository,
        },
        {
          provide: USER_READ_REPOSITORY,
          useClass: UserReadRepository,
        },
      ],
    }).compile();

    writeRepository = module.get<IUserWriteRepository>(USER_WRITE_REPOSITORY);
    readRepository = module.get<IUserReadRepository>(USER_READ_REPOSITORY);
  });

  describe(UserWriteRepository.prototype.findOneById.name, () => {
    let user: User;

    beforeEach(async () => {
      user = await writeRepository.insert(UserFactory.build());
    });

    describe('식별자에 해당하는 리소스가 존재하는 경우', () => {
      it('리소스를 반환해야한다.', async () => {
        await expect(
          readRepository.findOneById(user.id),
        ).resolves.toMatchObject({ id: user.id });
      });
    });

    describe('식별자에 해당하는 리소스가 존재하지 않는 경우', () => {
      it('undefined를 반환해야한다.', async () => {
        await expect(
          readRepository.findOneById(generateEntityId()),
        ).resolves.toBeUndefined();
      });
    });
  });

  describe(UserReadRepository.prototype.findAllOffsetPaginated.name, () => {
    beforeEach(async () => {
      const now = new Date();
      await writeRepository.insert(
        UserFactory.build({
          username: 'alpha',
          signInType: SignInType.username,
          createdAt: new Date(now.getTime() - 3000),
          updatedAt: now,
        }),
      );
      await writeRepository.insert(
        UserFactory.build({
          username: 'beta',
          signInType: SignInType.username,
          createdAt: new Date(now.getTime() - 2000),
          updatedAt: now,
        }),
      );
      await writeRepository.insert(
        UserFactory.build({
          username: 'alphabet',
          signInType: SignInType.username,
          createdAt: new Date(now.getTime() - 1000),
          updatedAt: now,
        }),
      );
    });

    it('offset/limit/order/filter 조건으로 페이지를 반환해야한다.', async () => {
      const page = await readRepository.findAllOffsetPaginated({
        pageInfo: {
          offset: 0,
          limit: 2,
        },
        order: [{ field: 'createdAt', direction: 'desc' }],
        filter: {
          username: 'alpha',
        },
      });

      expect(page.currentPage).toBe(1);
      expect(page.perPage).toBe(2);
      expect(page.totalCount).toBeGreaterThanOrEqual(2);
      expect(page.totalPages).toBeGreaterThanOrEqual(1);
      expect(page.data).toHaveLength(2);
      expect(page.data[0].username).toBe('alphabet');
      expect(page.data[1].username).toBe('alpha');
    });

    it('다음 페이지를 조회할 수 있어야한다.', async () => {
      const page = await readRepository.findAllOffsetPaginated({
        pageInfo: {
          offset: 2,
          limit: 2,
        },
        order: [{ field: 'createdAt', direction: 'desc' }],
        filter: {
          username: 'alpha',
        },
      });

      expect(page.currentPage).toBe(1);
      expect(page.perPage).toBe(2);
      expect(page.totalCount).toBeGreaterThanOrEqual(2);
      expect(page.totalPages).toBeGreaterThanOrEqual(1);
      expect(page.data).toHaveLength(2);
      expect(page.data[0].username).toBe('alphabet');
      expect(page.data[1].username).toBe('alpha');
    });
  });
});
