import { Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AuthTokens } from '@module/auth/entities/auth-tokens.vo';
import {
  AUTH_TOKEN_SERVICE,
  IAuthTokenService,
} from '@module/auth/services/auth-token/auth-token.service.interface';
import { SignUpWithUsernameCommand } from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.command';
import { User } from '@module/user/domain/user.entity';
import { CreateUserWithUsernameCommand } from '@module/user/use-cases/create-user-with-username/create-user-with-username.command';

@CommandHandler(SignUpWithUsernameCommand)
export class SignUpWithUsernameHandler implements ICommandHandler<
  SignUpWithUsernameCommand,
  AuthTokens
> {
  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,
    @Inject(AUTH_TOKEN_SERVICE)
    private readonly authTokenService: IAuthTokenService,
  ) {}

  async execute(command: SignUpWithUsernameCommand): Promise<AuthTokens> {
    const user = await this.commandBus.execute<
      CreateUserWithUsernameCommand,
      User
    >(
      new CreateUserWithUsernameCommand({
        username: command.username,
        password: command.password,
      }),
    );

    const authTokens = this.authTokenService.createTokens(user.id);

    return authTokens;
  }
}
