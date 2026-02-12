import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { Response } from 'express';

import { BaseHttpException } from '@common/base/base-http-exception';

@Catch(BaseHttpException)
export class BaseHttpExceptionFilter implements ExceptionFilter {
  catch(exception: BaseHttpException, host: ArgumentsHost): void {
    const { httpStatusCode } = exception;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(httpStatusCode).json(exception.getResponse());
  }
}
