import { faker } from '@faker-js/faker';

jest.mock('nestjs-request-context', () => ({
  RequestContext: {
    currentContext: {
      req: {
        user: {
          id: faker.string.numeric(),
        },
      },
    },
  },
}));
