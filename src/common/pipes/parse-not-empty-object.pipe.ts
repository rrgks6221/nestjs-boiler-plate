import { HttpStatus, PipeTransform } from '@nestjs/common';

import { BaseHttpException } from '@common/base/base-http-exception';
import { RequestValidationError } from '@common/base/base.error';

export class ParseNotEmptyObjectPipe implements PipeTransform {
  transform(value: unknown) {
    if (value && Object.keys(value).length === 0) {
      throw new BaseHttpException(
        HttpStatus.BAD_REQUEST,
        new RequestValidationError('request body field must be at least one'),
      );
    }
    return value;
  }
}
