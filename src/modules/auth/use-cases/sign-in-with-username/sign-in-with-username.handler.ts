import { Inject, Injectable } from '@nestjs/common';

import { AuthTokens } from '@module/auth/entities/auth-tokens.vo';
import { SignInfoMismatchedError } from '@module/auth/errors/sign-info-mismatched.error';
import {
  AUTH_TOKEN_SERVICE,
  IAuthTokenService,
} from '@module/auth/services/auth-token/auth-token.service.interface';
import { SignInWithUsernameCommand } from '@module/auth/use-cases/sign-in-with-username/sign-in-with-username.command';
import { UserNotFoundError } from '@module/user/errors/user-not-found.error';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@module/user/services/password-hasher/password-hasher.interface';
import { GetUserByUsernameHandler } from '@module/user/use-cases/get-user-by-username/get-user-by-username.handler';
import { GetUserByUsernameQuery } from '@module/user/use-cases/get-user-by-username/get-user-by-username.query';

import { ICommandHandler } from '@common/interfaces/command.interface';

@Injectable()
export class SignInWithUsernameHandler implements ICommandHandler<
  SignInWithUsernameCommand,
  AuthTokens
> {
  constructor(
    @Inject(GetUserByUsernameHandler)
    private readonly getUserByUsernameHandler: GetUserByUsernameHandler,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly authTokenService: IAuthTokenService,
  ) {}

  async execute(command: SignInWithUsernameCommand): Promise<AuthTokens> {
    const user = await this.getUserByUsernameHandler
      .execute(
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
