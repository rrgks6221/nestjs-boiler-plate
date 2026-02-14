import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';

import cookieParser from 'cookie-parser';

import { BaseHttpExceptionFilter } from '@common/base/base-http-exception-filter';
import { RequestValidationError } from '@common/base/base.error';

import { LOGGER } from '@shared/logger/logger.module';

export const setCookie = (app: INestApplication) => {
  app.use(cookieParser());
};

export const setCors = (app: INestApplication) => {
  app.enableCors({
    credentials: true,
    origin: true,
  });
};

export const setGlobalExceptionFilter = (app: INestApplication) => {
  app.useGlobalFilters(new BaseHttpExceptionFilter());
};

export const setGlobalPipe = (app: INestApplication) => {
  const options: Omit<ValidationPipeOptions, 'exceptionFactory'> = {
    transform: true,
    whitelist: true,
  };

  const exceptionFactory = (validationErrors: ValidationError[]) => {
    function flattenValidationErrors(
      errors: ValidationError[],
      parentPath: string = '',
    ): any[] {
      return errors.flatMap(({ property, constraints, children }) => {
        const path = parentPath ? `${parentPath}.${property}` : property;
        let result: unknown[] = [];

        if (constraints) {
          result.push({
            property: path,
            constraints: Object.values(constraints).map((message) =>
              message.replace(property, path),
            ),
          });
        }

        if (children?.length) {
          result = result.concat(flattenValidationErrors(children, path));
        }

        return result;
      });
    }

    throw new BadRequestException({
      statusCode: 400,
      message: 'request input validation error',
      code: RequestValidationError.CODE,
      errors: flattenValidationErrors(validationErrors),
    });
  };

  app.useGlobalPipes(new ValidationPipe({ ...options, exceptionFactory }));
};

export const setLogger = (app: INestApplication) => {
  app.useLogger(app.get(LOGGER));
};
