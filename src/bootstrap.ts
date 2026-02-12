import { INestApplication } from '@nestjs/common';

import { BaseHttpExceptionFilter } from '@common/base/base-http-exception-filter';

export const setGlobalExceptionFilter = (app: INestApplication) => {
  app.useGlobalFilters(new BaseHttpExceptionFilter());
};
