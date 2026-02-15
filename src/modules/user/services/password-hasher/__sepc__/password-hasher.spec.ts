import { Test, TestingModule } from '@nestjs/testing';

import { faker } from '@faker-js/faker';

import { PasswordHasher } from '@module/user/services/password-hasher/password-hasher';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@module/user/services/password-hasher/password-hasher.interface';
import { PasswordHasherModule } from '@module/user/services/password-hasher/password-hasher.module';

import { ConfigModuleFactory } from '@common/factories/config-module.factory';

describe(PasswordHasher.name, () => {
  let passwordHasher: IPasswordHasher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModuleFactory(), PasswordHasherModule],
    }).compile();

    passwordHasher = module.get<IPasswordHasher>(PASSWORD_HASHER);
  });

  describe(PasswordHasher.prototype.hash.name, () => {
    it('암호화된 문자열을 반환해야한다.', async () => {
      const plain = faker.internet.password();
      await expect(passwordHasher.hash('plain')).resolves.not.toBe(plain);
    });
  });

  describe(PasswordHasher.prototype.compare.name, () => {
    let plain: string;
    let hashed: string;

    beforeEach(async () => {
      plain = faker.internet.password();
      hashed = await passwordHasher.hash(plain);
    });

    it('일치하는 문자열이면 true를 반환해야한다.', async () => {
      await expect(passwordHasher.compare(plain, hashed)).resolves.toBe(true);
    });

    it('일치하지 않는 문자열이면 false를 반환해야한다.', async () => {
      await expect(passwordHasher.compare('wrong', hashed)).resolves.toBe(
        false,
      );
    });
  });
});
