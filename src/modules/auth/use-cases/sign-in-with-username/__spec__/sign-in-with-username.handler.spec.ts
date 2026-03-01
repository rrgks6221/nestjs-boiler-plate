import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthTokenService } from '@module/auth-security/services/auth-token.service';
import { AUTH_TOKEN_SERVICE } from '@module/auth-security/services/auth-token.service.interface';
import { AuthTokens } from '@module/auth/entities/auth-tokens.vo';
import { SignInfoMismatchedError } from '@module/auth/errors/sign-info-mismatched.error';
import { SignInWithUsernameCommandFactory } from '@module/auth/use-cases/sign-in-with-username/__spec__/sign-in-with-username.command.factory';
import { SignInWithUsernameCommand } from '@module/auth/use-cases/sign-in-with-username/sign-in-with-username.command';
import { SignInWithUsernameHandler } from '@module/auth/use-cases/sign-in-with-username/sign-in-with-username.handler';
import { UserFactory } from '@module/user/domain/__spec__/user.entity.factory';
import { UserWriteRepository } from '@module/user/repositories/user.write-repository';
import {
  IUserWriteRepository,
  USER_WRITE_REPOSITORY,
} from '@module/user/repositories/user.write-repository.interface';
import { PasswordHasher } from '@module/user/services/password-hasher';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@module/user/services/password-hasher.interface';

import { ClsModuleFactory } from '@common/factories/cls-module.factory';
import { ConfigModuleFactory } from '@common/factories/config-module.factory';

import { EventStoreModule } from '@core/event-sourcing/event-store.module';

describe(SignInWithUsernameHandler.name, () => {
  let handler: SignInWithUsernameHandler;

  let userWriteRepository: IUserWriteRepository;

  let passwordHasher: IPasswordHasher;

  let command: SignInWithUsernameCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ClsModuleFactory(),
        ConfigModuleFactory(),
        JwtModule.register({ global: true, secret: 'test' }),
        EventStoreModule,
      ],
      providers: [
        SignInWithUsernameHandler,
        {
          provide: USER_WRITE_REPOSITORY,
          useClass: UserWriteRepository,
        },
        {
          provide: PASSWORD_HASHER,
          useClass: PasswordHasher,
        },
        {
          provide: AUTH_TOKEN_SERVICE,
          useClass: AuthTokenService,
        },
      ],
    }).compile();

    handler = module.get<SignInWithUsernameHandler>(SignInWithUsernameHandler);
    userWriteRepository = module.get<IUserWriteRepository>(
      USER_WRITE_REPOSITORY,
    );
    passwordHasher = module.get<IPasswordHasher>(PASSWORD_HASHER);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    command = SignInWithUsernameCommandFactory.build();
  });

  describe('인증정보가 일치하는 유저가 로그인하면', () => {
    beforeEach(async () => {
      await userWriteRepository.insert(
        UserFactory.build({
          username: command.username,
          password: command.password,
        }),
      );
      jest.spyOn(passwordHasher, 'compare').mockResolvedValue(true);
    });

    it('인증 토큰을 반환해야한다.', async () => {
      await expect(handler.execute(command)).resolves.toBeInstanceOf(
        AuthTokens,
      );
    });
  });

  describe('username과 일치하는 유저가 존재하지 않는 경우', () => {
    it('로그인 정보가 일치하지 않는다는 에러가 발생해야한다.', async () => {
      await expect(handler.execute(command)).rejects.toThrow(
        SignInfoMismatchedError,
      );
    });
  });

  describe('password가 일치하지 않는 경우', () => {
    beforeEach(async () => {
      await userWriteRepository.insert(
        UserFactory.build({
          username: command.username,
        }),
      );
      jest.spyOn(passwordHasher, 'compare').mockResolvedValue(false);
    });

    it('로그인 정보가 일치하지 않는다는 에러가 발생해야한다.', async () => {
      await expect(handler.execute(command)).rejects.toThrow(
        SignInfoMismatchedError,
      );
    });
  });
});
