import { Test, TestingModule } from '@nestjs/testing';

import { UserFactory } from '@module/user/domain/__spec__/user.entity.factory';
import { UserNotFoundError } from '@module/user/errors/user-not-found.error';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@module/user/repositories/user/user.repository.interface';
import { UserRepositoryModule } from '@module/user/repositories/user/user.repository.module';
import { GetUserByUsernameQueryFactory } from '@module/user/use-cases/get-user-by-username/__spec__/get-user-by-username.query.factory';
import { GetUserByUsernameHandler } from '@module/user/use-cases/get-user-by-username/get-user-by-username.handler';
import { GetUserByUsernameQuery } from '@module/user/use-cases/get-user-by-username/get-user-by-username.query';

import { ClsModuleFactory } from '@common/factories/cls-module.factory';

describe(GetUserByUsernameHandler.name, () => {
  let handler: GetUserByUsernameHandler;

  let userRepository: IUserRepository;

  let query: GetUserByUsernameQuery;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ClsModuleFactory(), UserRepositoryModule],
      providers: [GetUserByUsernameHandler],
    }).compile();

    handler = module.get<GetUserByUsernameHandler>(GetUserByUsernameHandler);
    userRepository = module.get<IUserRepository>(USER_REPOSITORY);
  });

  beforeEach(() => {
    query = GetUserByUsernameQueryFactory.build();
  });

  describe('username과 일치하는 유저가 존재하는 경우', () => {
    beforeEach(async () => {
      await userRepository.insert(
        UserFactory.build({ username: query.username }),
      );
    });

    it('유저를 반환해야한다.', async () => {
      await expect(handler.execute(query)).resolves.toMatchObject({
        username: query.username,
      });
    });
  });

  describe('유저 식별자와 일치하는 유저가 존재하지 않는 경우', () => {
    it('유저가 존재하지 않는다는 에러가 발생해야한다', async () => {
      await expect(handler.execute(query)).rejects.toThrow(UserNotFoundError);
    });
  });
});
