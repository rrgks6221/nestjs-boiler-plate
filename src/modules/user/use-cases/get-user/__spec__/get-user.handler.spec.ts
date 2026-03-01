import { Test, TestingModule } from '@nestjs/testing';

import { UserFactory } from '@module/user/domain/__spec__/user.entity.factory';
import { UserNotFoundError } from '@module/user/errors/user-not-found.error';
import { UserReadRepository } from '@module/user/repositories/user.read-repository';
import {
  IUserReadRepository,
  USER_READ_REPOSITORY,
} from '@module/user/repositories/user.read-repository.interface';
import { UserWriteRepository } from '@module/user/repositories/user.write-repository';
import { IUserWriteRepository } from '@module/user/repositories/user.write-repository.interface';
import { GetUserQueryFactory } from '@module/user/use-cases/get-user/__spec__/get-user.query.factory';
import { GetUserHandler } from '@module/user/use-cases/get-user/get-user.handler';
import { GetUserQuery } from '@module/user/use-cases/get-user/get-user.query';

import { ClsModuleFactory } from '@common/factories/cls-module.factory';

import { PrismaModule } from '@shared/prisma/prisma.module';

describe(GetUserHandler.name, () => {
  let handler: GetUserHandler;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userReadRepository: IUserReadRepository;
  let userWriteRepository: IUserWriteRepository;

  let query: GetUserQuery;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ClsModuleFactory(), PrismaModule],
      providers: [
        GetUserHandler,
        {
          provide: USER_READ_REPOSITORY,
          useClass: UserReadRepository,
        },
        {
          provide: USER_READ_REPOSITORY,
          useClass: UserWriteRepository,
        },
      ],
    }).compile();

    handler = module.get<GetUserHandler>(GetUserHandler);
    userReadRepository = module.get<IUserReadRepository>(USER_READ_REPOSITORY);
    userWriteRepository =
      module.get<IUserWriteRepository>(USER_READ_REPOSITORY);
  });

  beforeEach(() => {
    query = GetUserQueryFactory.build();
  });

  describe('유저 식별자와 일치하는 유저가 존재하는 경우', () => {
    beforeEach(async () => {
      await userWriteRepository.insert(UserFactory.build({ id: query.userId }));
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
