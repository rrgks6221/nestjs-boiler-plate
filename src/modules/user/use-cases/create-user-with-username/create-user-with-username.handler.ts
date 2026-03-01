import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { User } from '@module/user/domain/user.entity';
import { UserUsernameAlreadyOccupiedError } from '@module/user/errors/user-username-already-occupied.error';
import {
  IUserWriteRepository,
  USER_WRITE_REPOSITORY,
} from '@module/user/repositories/user.write-repository.interface';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@module/user/services/password-hasher.interface';
import { CreateUserWithUsernameCommand } from '@module/user/use-cases/create-user-with-username/create-user-with-username.command';

import { UniqueConstraintViolationError } from '@common/base/base.error';

@CommandHandler(CreateUserWithUsernameCommand)
export class CreateUserWithUsernameHandler implements ICommandHandler<
  CreateUserWithUsernameCommand,
  User
> {
  constructor(
    @Inject(USER_WRITE_REPOSITORY)
    private readonly userWriteRepository: IUserWriteRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: CreateUserWithUsernameCommand): Promise<User> {
    const existingUserByUsername =
      await this.userWriteRepository.findOneByUsername(command.username);

    if (existingUserByUsername !== undefined) {
      throw new UserUsernameAlreadyOccupiedError();
    }

    const user = User.createWithUsername({
      username: command.username,
      hashedPassword: await this.passwordHasher.hash(command.password),
    });

    try {
      await this.userWriteRepository.insert(user);
    } catch (error) {
      if (error instanceof UniqueConstraintViolationError) {
        throw new UserUsernameAlreadyOccupiedError();
      }

      throw error;
    }

    return user;
  }
}
