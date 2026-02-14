import { INestApplication } from '@nestjs/common';

import cookieParser from 'cookie-parser';

import { BaseHttpExceptionFilter } from '@common/base/base-http-exception-filter';

export const setCookie = (app: INestApplication) => {
  app.use(cookieParser());
};

export const setGlobalExceptionFilter = (app: INestApplication) => {
  app.useGlobalFilters(new BaseHttpExceptionFilter());
};
