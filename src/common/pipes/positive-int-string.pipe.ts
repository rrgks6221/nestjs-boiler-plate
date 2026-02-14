import { ArgumentMetadata, HttpStatus, PipeTransform } from '@nestjs/common';

import { BaseHttpException } from '@common/base/base-http-exception';
import { RequestValidationError } from '@common/base/base.error';

export class ParsePositiveIntStringPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): string {
    const { type, data } = metadata;
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
      throw new BaseHttpException(
        HttpStatus.BAD_REQUEST,
        new RequestValidationError(
          `request ${type} ${data} must be a positive integer string`,
        ),
      );
    }

    return value;
  }
}
