import { INestApplication } from '@nestjs/common';

import cookieParser from 'cookie-parser';

import { BaseHttpExceptionFilter } from '@common/base/base-http-exception-filter';

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
