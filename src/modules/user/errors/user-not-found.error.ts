import { BaseError } from '@common/base/base.error';

export class UserNotFoundError extends BaseError {
  static CODE: string = 'USER.NOT_FOUND';

  constructor(message?: string) {
    super(message ?? 'User not found', UserNotFoundError.CODE);
  }
}
