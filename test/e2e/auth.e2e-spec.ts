/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { faker } from '@faker-js/faker';
import {
  E2ETestContext,
  createE2ETestContext,
} from '@test/create-e2e-test-context';
import request from 'supertest';

describe('Auth API (e2e)', () => {
  let context: E2ETestContext;

  beforeAll(async () => {
    context = await createE2ETestContext();
  });

  afterAll(async () => {
    await context.app.close();
  });

  describe('POST /auth/sign-up/username', () => {
    it('회원가입 후 쿠키를 내려줘야 한다', async () => {
      const response = await context.httpAgent
        .post('/auth/sign-up/username')
        .send({
          username: `signup_${faker.string.nanoid(10)}`,
          password: 'qwer1234',
        });

      expect(response.status).toBe(201);
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining('access_token='),
          expect.stringContaining('refresh_token='),
        ]),
      );
    });

    it('중복 username이면 409를 반환해야 한다', async () => {
      const username = faker.string.nanoid(10);

      await context.httpAgent.post('/auth/sign-up/username').send({
        username,
        password: 'qwer1234',
      });

      const response = await context.httpAgent
        .post('/auth/sign-up/username')
        .send({
          username,
          password: 'qwer1234',
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 409,
          code: 'USER.USERNAME_ALREADY_OCCUPIED',
        }),
      );
    });
  });

  describe('POST /auth/sign-in/username', () => {
    it('로그인 후 쿠키를 내려줘야 한다', async () => {
      const username = faker.string.nanoid(10);
      const password = 'qwer1234';

      await context.httpAgent.post('/auth/sign-up/username').send({
        username,
        password,
      });

      const response = await context.httpAgent
        .post('/auth/sign-in/username')
        .send({
          username,
          password,
        });

      expect(response.status).toBe(201);
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining('access_token='),
          expect.stringContaining('refresh_token='),
        ]),
      );
    });

    it('존재하지 않는 사용자라면 403을 반환해야 한다', async () => {
      const username = faker.string.nanoid(10);

      const response = await context.httpAgent
        .post('/auth/sign-in/username')
        .send({
          username,
          password: 'password',
        });

      expect(response.status).toBe(403);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 403,
          code: 'AUTH.SIGN_INFO_MISMATCHED',
        }),
      );
    });

    it('비밀번호가 틀리면 403을 반환해야 한다', async () => {
      const username = faker.string.nanoid(10);

      await context.httpAgent.post('/auth/sign-up/username').send({
        username,
        password: 'qwer1234',
      });

      const response = await context.httpAgent
        .post('/auth/sign-in/username')
        .send({
          username,
          password: 'wrong-password',
        });

      expect(response.status).toBe(403);
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 403,
          code: 'AUTH.SIGN_INFO_MISMATCHED',
        }),
      );
    });
  });

  describe('POST /auth/logout', () => {
    it('로그아웃 후 인증 쿠키가 제거되어야 한다', async () => {
      const logoutAgent = request.agent(context.app.getHttpServer());
      const username = faker.string.nanoid(10);
      const password = 'qwer1234';

      await logoutAgent.post('/auth/sign-up/username').send({
        username,
        password,
      });
      await logoutAgent.post('/auth/sign-in/username').send({
        username,
        password,
      });

      const logoutResponse = await logoutAgent.post('/auth/logout');

      expect(logoutResponse.status).toBe(204);
      expect(logoutResponse.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining('access_token=;'),
          expect.stringContaining('refresh_token=;'),
          expect.stringContaining('Path=/'),
          expect.stringContaining('Path=/auth'),
        ]),
      );

      const meResponse = await logoutAgent.get('/users/me');

      expect(meResponse.status).toBe(401);
      expect(meResponse.body).toEqual(
        expect.objectContaining({
          statusCode: 401,
          code: 'COMMON.UNAUTHORIZED',
        }),
      );
    });
  });
});
