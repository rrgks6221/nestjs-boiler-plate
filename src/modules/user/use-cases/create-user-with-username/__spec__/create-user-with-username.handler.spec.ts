import { Test, TestingModule } from '@nestjs/testing';

import { UserFactory } from '@module/user/domain/__spec__/user.entity.factory';
import { SignInType } from '@module/user/domain/user.entity';
import { UserUsernameAlreadyOccupiedError } from '@module/user/errors/user-username-already-occupied.error';
import { UserRepository } from '@module/user/repositories/user.repository';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@module/user/repositories/user.repository.interface';
import { PasswordHasher } from '@module/user/services/password-hasher';
import { PASSWORD_HASHER } from '@module/user/services/password-hasher.interface';
import { CreateUserWithUsernameCommandFactory } from '@module/user/use-cases/create-user-with-username/__spec__/create-user-with-username.command.factory';
import { CreateUserWithUsernameCommand } from '@module/user/use-cases/create-user-with-username/create-user-with-username.command';
import { CreateUserWithUsernameHandler } from '@module/user/use-cases/create-user-with-username/create-user-with-username.handler';

import { ClsModuleFactory } from '@common/factories/cls-module.factory';
import { ConfigModuleFactory } from '@common/factories/config-module.factory';

describe(CreateUserWithUsernameHandler.name, () => {
  let handler: CreateUserWithUsernameHandler;

  let userRepository: IUserRepository;

  let command: CreateUserWithUsernameCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ClsModuleFactory(), ConfigModuleFactory()],
      providers: [
        CreateUserWithUsernameHandler,
        {
          provide: USER_REPOSITORY,
          useClass: UserRepository,
        },
        {
          provide: PASSWORD_HASHER,
          useClass: PasswordHasher,
        },
      ],
    }).compile();

    handler = module.get<CreateUserWithUsernameHandler>(
      CreateUserWithUsernameHandler,
    );
    userRepository = module.get<IUserRepository>(USER_REPOSITORY);
  });

  beforeEach(() => {
    command = CreateUserWithUsernameCommandFactory.build();
  });

  describe('유저를 생성하면', () => {
    it('유저를 생성해야한다.', async () => {
      await expect(handler.execute(command)).resolves.toEqual(
        expect.objectContaining({
          signInType: SignInType.username,
          username: command.username,
          password: expect.any(String),
        }),
      );
    });
  });

  describe('이미 존재하는 username으로 유저를 생성하면', () => {
    beforeEach(async () => {
      await userRepository.insert(
        UserFactory.build({ username: command.username }),
      );
    });

    it('에러가 발생해야한다.', async () => {
      await expect(handler.execute(command)).rejects.toThrow(
        UserUsernameAlreadyOccupiedError,
      );
    });
  });

  describe('저장 시 유니크 제약조건 충돌이 발생하면', () => {
    beforeEach(async () => {
      await userRepository.insert(
        UserFactory.build({ username: command.username }),
      );
    });

    it('username이 이미 사용중이라는 에러가 발생해야한다.', async () => {
      await expect(handler.execute(command)).rejects.toThrow(
        UserUsernameAlreadyOccupiedError,
      );
    });
  });
});
