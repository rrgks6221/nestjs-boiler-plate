import { HttpStatus } from '@nestjs/common';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { BaseError } from '@common/base/base.error';

export class BaseHttpException extends Error {
  constructor(
    readonly httpStatusCode: HttpStatus,
    readonly error: BaseError,
  ) {
    super(error.message);
  }

  getResponse() {
    return {
      statusCode: this.httpStatusCode,
      message: this.message,
      code: this.error.code,
    };
  }

  static buildSwaggerSchema(codes: string[]): SchemaObject {
    return {
      properties: {
        statusCode: {
          type: 'number',
          format: 'integer',
          description: 'http status code',
        },
        message: {
          type: 'string',
          description: 'error message',
        },
        code: {
          type: 'string',
          description: 'error code',
          example: codes[0],
          enum: codes,
        },
      },
    };
  }
}
