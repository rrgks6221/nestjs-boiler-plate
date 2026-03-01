import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Transactional } from '@nestjs-cls/transactional';

import {
  AUTH_TOKEN_SERVICE,
  IAuthTokenService,
} from '@module/auth-security/services/auth-token.service.interface';
import { AuthTokens } from '@module/auth/entities/auth-tokens.vo';
import { SignInfoMismatchedError } from '@module/auth/errors/sign-info-mismatched.error';
import { SignInWithUsernameCommand } from '@module/auth/use-cases/sign-in-with-username/sign-in-with-username.command';
import {
  IUserWriteRepository,
  USER_WRITE_REPOSITORY,
} from '@module/user/repositories/user.write-repository.interface';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@module/user/services/password-hasher.interface';

import {
  EVENT_STORE,
  IEventStore,
} from '@core/event-sourcing/event-store.interface';

@CommandHandler(SignInWithUsernameCommand)
export class SignInWithUsernameHandler implements ICommandHandler<
  SignInWithUsernameCommand,
  AuthTokens
> {
  constructor(
    @Inject(USER_WRITE_REPOSITORY)
    private readonly userWriteRepository: IUserWriteRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly authTokenService: IAuthTokenService,
    @Inject(EVENT_STORE)
    private readonly eventStore: IEventStore,
  ) {}

  @Transactional()
  async execute(command: SignInWithUsernameCommand): Promise<AuthTokens> {
    const user = await this.userWriteRepository.findOneByUsername(
      command.username,
    );

    if (user === undefined) {
      throw new SignInfoMismatchedError();
    }

    const isPasswordMatch = await this.passwordHasher.compare(
      command.password,
      user.password,
    );

    if (isPasswordMatch === false) {
      throw new SignInfoMismatchedError();
    }

    user.signIn();
    await this.eventStore.storeAggregateEvents(user, user.id);

    const authTokens = this.authTokenService.createTokens(user.id);

    return authTokens;
  }
}
