import { Test, TestingModule } from '@nestjs/testing';

import { UserFactory } from '@module/user/domain/__spec__/user.entity.factory';
import { UserNotFoundError } from '@module/user/errors/user-not-found.error';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@module/user/repositories/user/user.repository.interface';
import { UserRepositoryModule } from '@module/user/repositories/user/user.repository.module';
import { GetUserQueryFactory } from '@module/user/use-cases/get-user/__spec__/get-user.query.factory';
import { GetUserHandler } from '@module/user/use-cases/get-user/get-user.handler';
import { GetUserQuery } from '@module/user/use-cases/get-user/get-user.query';

import { ClsModuleFactory } from '@common/factories/cls-module.factory';

describe(GetUserHandler.name, () => {
  let handler: GetUserHandler;

  let userRepository: IUserRepository;

  let query: GetUserQuery;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ClsModuleFactory(), UserRepositoryModule],
      providers: [GetUserHandler],
    }).compile();

    handler = module.get<GetUserHandler>(GetUserHandler);
    userRepository = module.get<IUserRepository>(USER_REPOSITORY);
  });

  beforeEach(() => {
    query = GetUserQueryFactory.build();
  });

  describe('유저 식별자와 일치하는 유저가 존재하는 경우', () => {
    beforeEach(async () => {
      await userRepository.insert(UserFactory.build({ id: query.userId }));
    });

    it('유저를 반환해야한다.', async () => {
      await expect(handler.execute(query)).resolves.toMatchObject({
        id: query.userId,
      });
    });
  });

  describe('유저 식별자와 일치하는 유저가 존재하지 않는 경우', () => {
    it('유저가 존재하지 않는다는 에러가 발생해야한다', async () => {
      await expect(handler.execute(query)).rejects.toThrow(UserNotFoundError);
    });
  });
});
