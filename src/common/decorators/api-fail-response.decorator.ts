import { applyDecorators } from '@nestjs/common';
import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';
import { ApiResponse } from '@nestjs/swagger';

import { BaseHttpException } from '@common/base/base-http-exception';
import { BaseError } from '@common/base/base.error';

type BaseErrorClassAndCode = { new (...args: any[]): BaseError } & {
  CODE: string;
};

type ErrorMap = Partial<Record<ErrorHttpStatusCode, BaseErrorClassAndCode[]>>;

export const ApiErrorResponse = (errorMap: ErrorMap) => {
  const apiErrors = Object.entries(errorMap).map(([statusCode, errors]) => {
    return applyDecorators(
      ApiResponse({
        status: Number(statusCode),
        schema: BaseHttpException.buildSwaggerSchema(
          errors.map((err) => err.CODE),
        ),
      }),
    );
  });

  return applyDecorators(...apiErrors);
};
