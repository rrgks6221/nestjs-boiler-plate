import { Test, TestingModule } from '@nestjs/testing';

import { faker } from '@faker-js/faker';

import { UserFactory } from '@module/user/domain/__spec__/user.entity.factory';
import { User } from '@module/user/domain/user.entity';
import { UserWriteRepository } from '@module/user/repositories/user.write-repository';
import {
  IUserWriteRepository,
  USER_WRITE_REPOSITORY,
} from '@module/user/repositories/user.write-repository.interface';

import { generateEntityId } from '@common/base/base.entity';
import { ClsModuleFactory } from '@common/factories/cls-module.factory';

describe(UserWriteRepository.name, () => {
  let repository: IUserWriteRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ClsModuleFactory()],
      providers: [
        {
          provide: USER_WRITE_REPOSITORY,
          useClass: UserWriteRepository,
        },
      ],
    }).compile();

    repository = module.get<IUserWriteRepository>(USER_WRITE_REPOSITORY);
  });

  describe(UserWriteRepository.prototype.insert.name, () => {
    let user: User;

    beforeEach(() => {
      user = UserFactory.build();
    });

    it('리소스를 생성해야한다.', async () => {
      await expect(repository.insert(user)).resolves.toEqual(user);
      await expect(repository.findOneById(user.id)).resolves.toEqual(user);
    });
  });

  describe(UserWriteRepository.prototype.findOneById.name, () => {
    let user: User;

    beforeEach(async () => {
      user = await repository.insert(UserFactory.build());
    });

    describe('식별자에 해당하는 리소스가 존재하는 경우', () => {
      it('리소스를 반환해야한다.', async () => {
        await expect(repository.findOneById(user.id)).resolves.toEqual(user);
      });
    });

    describe('식별자에 해당하는 리소스가 존재하지 않는 경우', () => {
      it('undefined를 반환해야한다.', async () => {
        await expect(
          repository.findOneById(generateEntityId()),
        ).resolves.toBeUndefined();
      });
    });
  });

  describe(UserWriteRepository.prototype.findOneByUsername.name, () => {
    let user: User;

    beforeEach(async () => {
      user = await repository.insert(UserFactory.build());
    });

    describe('username에 해당하는 리소스가 존재하는 경우', () => {
      it('리소스를 반환해야한다.', async () => {
        await expect(
          repository.findOneByUsername(user.username),
        ).resolves.toEqual(user);
      });
    });

    describe('식별자에 해당하는 리소스가 존재하지 않는 경우', () => {
      it('undefined를 반환해야한다.', async () => {
        await expect(
          repository.findOneByUsername(faker.internet.username()),
        ).resolves.toBeUndefined();
      });
    });
  });

  describe(UserWriteRepository.prototype.update.name, () => {
    let user: User;

    beforeEach(async () => {
      user = await repository.insert(UserFactory.build());
    });

    it('리소스를 수정해야한다.', async () => {
      const newUser = UserFactory.build({
        id: user.id,
      });

      await expect(repository.update(newUser)).resolves.toEqual(newUser);
      await expect(repository.findOneById(user.id)).resolves.toEqual(newUser);
    });
  });

  describe(UserWriteRepository.prototype.delete.name, () => {
    let user: User;

    beforeEach(async () => {
      user = await repository.insert(UserFactory.build());
    });

    it('리소스를 삭제해야한다.', async () => {
      await expect(repository.delete(user)).resolves.toBeUndefined();
      await expect(repository.findOneById(user.id)).resolves.toBeUndefined();
    });
  });
});
