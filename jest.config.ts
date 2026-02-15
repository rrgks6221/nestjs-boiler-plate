export default {
  /**
   * 병렬실행에 의한 커넥션 부족을 해결하기 위해 max worker 개수를 조정
   */
  maxWorkers: 2,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['**/*.(t|j)s'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@module/(.*)$': '<rootDir>/src/modules/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^generated/(.*)$': '<rootDir>/generated/$1',
  },
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  displayName: 'nestjs-cqrs-boilerplate',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  setupFilesAfterEnv: [
    '<rootDir>/test/after-env-setup.ts',
    'jest-extended/all',
    'jest-sorted',
  ],
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
};
