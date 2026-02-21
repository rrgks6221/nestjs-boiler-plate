/* eslint-disable no-restricted-imports */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import {
  setCookie,
  setCors,
  setGlobalExceptionFilter,
  setGlobalPipe,
} from '../src/bootstrap';
import { faker } from '@faker-js/faker';
import request from 'supertest';

interface E2ETestContext {
  app: INestApplication;
  httpAgent: ReturnType<typeof request.agent>;
  authenticatedHttpAgent: ReturnType<typeof request.agent>;
}

export const createE2ETestContext = async (): Promise<E2ETestContext> => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  setCookie(app);
  setCors(app);
  setGlobalExceptionFilter(app);
  setGlobalPipe(app);
  await app.init();

  const httpAgent = request.agent(app.getHttpServer());
  const authenticatedHttpAgent = request.agent(app.getHttpServer());

  const username = `e2e_user_${faker.string.nanoid(5)}`;
  const password = 'qwer1234';

  const seedSignUpResponse = await authenticatedHttpAgent
    .post('/auth/sign-up/username')
    .send({ username, password });

  if (seedSignUpResponse.status !== 201) {
    throw new Error('failed to seed authenticated test user');
  }

  const seedAuthResponse = await authenticatedHttpAgent
    .post('/auth/sign-in/username')
    .send({ username, password });

  if (seedAuthResponse.status !== 201) {
    throw new Error('failed to create authenticated http agent');
  }

  return {
    app,
    httpAgent,
    authenticatedHttpAgent,
  };
};
