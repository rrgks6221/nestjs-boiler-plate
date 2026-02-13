import { Inject, Injectable } from '@nestjs/common';

import { AuthTokens } from '@module/auth/entities/auth-tokens.vo';
import {
  AUTH_TOKEN_SERVICE,
  IAuthTokenService,
} from '@module/auth/services/auth-token/auth-token.service.interface';
import { SignUpWithUsernameCommand } from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.command';
import { CreateUserWithUsernameCommand } from '@module/user/use-cases/create-user-with-username/create-user-with-username.command';
import { CreateUserWithUsernameHandler } from '@module/user/use-cases/create-user-with-username/create-user-with-username.handler';

import { ICommandHandler } from '@common/interfaces/command.interface';

@Injectable()
export class SignUpWithUsernameHandler implements ICommandHandler<
  SignUpWithUsernameCommand,
  AuthTokens
> {
  constructor(
    @Inject(CreateUserWithUsernameHandler)
    private readonly createUserWithUsernameHandler: CreateUserWithUsernameHandler,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly authTokenService: IAuthTokenService,
  ) {}

  async execute(command: SignUpWithUsernameCommand): Promise<AuthTokens> {
    const user = await this.createUserWithUsernameHandler.execute(
      new CreateUserWithUsernameCommand({
        username: command.username,
        password: command.password,
      }),
    );

    const authTokens = this.authTokenService.createTokens(user.id);

    return authTokens;
  }
}
