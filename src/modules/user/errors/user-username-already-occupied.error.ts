import { BaseError } from '@common/base/base.error';

export class UserUsernameAlreadyOccupiedError extends BaseError {
  static CODE: string = 'User.USERNAME_ALREADY_OCCUPIED';

  constructor(message?: string) {
    super(
      message ?? 'User username is already occupied',
      UserUsernameAlreadyOccupiedError.CODE,
    );
  }
}
