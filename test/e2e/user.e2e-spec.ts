import {
  E2ETestContext,
  createE2ETestContext,
} from '@test/create-e2e-test-context';

describe('User API (e2e)', () => {
  let context: E2ETestContext;

  beforeAll(async () => {
    context = await createE2ETestContext();
  });

  afterAll(async () => {
    await context.app.close();
  });

  describe('GET /users/me', () => {
    it('인증된 사용자의 정보를 반환해야 한다', async () => {
      const response = await context.authenticatedHttpAgent.get('/users/me');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          signInType: expect.any(String),
        }),
      );
    });
  });
});
