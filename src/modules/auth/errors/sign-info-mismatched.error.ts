import { BaseError } from '@common/base/base.error';

export class SignInfoMismatchedError extends BaseError {
  static CODE: string = 'AUTH.SIGN_INFO_MISMATCHED';

  constructor(message?: string) {
    super(message ?? 'Sign info not mismatched', SignInfoMismatchedError.CODE);
  }
}
