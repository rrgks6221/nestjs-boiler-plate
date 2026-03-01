import { Test, TestingModule } from '@nestjs/testing';

import { UserFactory } from '@module/user/domain/__spec__/user.entity.factory';
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
});
