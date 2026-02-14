import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';

import { AuthTokens } from '@module/auth/entities/auth-tokens.vo';
import { SignInfoMismatchedError } from '@module/auth/errors/sign-info-mismatched.error';
import {
  AUTH_TOKEN_SERVICE,
  IAuthTokenService,
} from '@module/auth/services/auth-token/auth-token.service.interface';
import { SignInWithUsernameCommand } from '@module/auth/use-cases/sign-in-with-username/sign-in-with-username.command';
import { User } from '@module/user/domain/user.entity';
import { UserNotFoundError } from '@module/user/errors/user-not-found.error';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@module/user/services/password-hasher/password-hasher.interface';
import { GetUserByUsernameQuery } from '@module/user/use-cases/get-user-by-username/get-user-by-username.query';

@CommandHandler(SignInWithUsernameCommand)
export class SignInWithUsernameHandler implements ICommandHandler<
  SignInWithUsernameCommand,
  AuthTokens
> {
  constructor(
    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly authTokenService: IAuthTokenService,
  ) {}

  async execute(command: SignInWithUsernameCommand): Promise<AuthTokens> {
    const user = await this.queryBus
      .execute<GetUserByUsernameQuery, User>(
        new GetUserByUsernameQuery({
          username: command.username,
        }),
      )
      .catch((e) => {
        if (e instanceof UserNotFoundError) {
          throw new SignInfoMismatchedError();
        }
        throw e;
      });

    const isPasswordMatch = await this.passwordHasher.compare(
      command.password,
      user.password,
    );

    if (isPasswordMatch === false) {
      throw new SignInfoMismatchedError();
    }

    const authTokens = this.authTokenService.createTokens(user.id);

    return authTokens;
  }
}
