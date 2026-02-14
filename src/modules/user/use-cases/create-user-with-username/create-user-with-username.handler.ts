import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { User } from '@module/user/domain/user.entity';
import { UserUsernameAlreadyOccupiedError } from '@module/user/errors/user-username-already-occupied.error';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@module/user/repositories/user/user.repository.interface';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@module/user/services/password-hasher/password-hasher.interface';
import { CreateUserWithUsernameCommand } from '@module/user/use-cases/create-user-with-username/create-user-with-username.command';

@CommandHandler(CreateUserWithUsernameCommand)
export class CreateUserWithUsernameHandler implements ICommandHandler<
  CreateUserWithUsernameCommand,
  User
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: CreateUserWithUsernameCommand): Promise<User> {
    const existingUserByUsername = await this.userRepository.findOneByUsername(
      command.username,
    );

    if (existingUserByUsername !== undefined) {
      throw new UserUsernameAlreadyOccupiedError();
    }

    const user = User.createWithUsername({
      username: command.username,
      hashedPassword: await this.passwordHasher.hash(command.password),
    });

    await this.userRepository.insert(user);

    return user;
  }
}
