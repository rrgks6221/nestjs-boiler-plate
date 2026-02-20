import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import bcrypt from 'bcrypt';

import { IPasswordHasher } from '@module/user/services/password-hasher.interface';

import { ENV_KEY } from '@common/factories/config-module.factory';

@Injectable()
export class PasswordHasher implements IPasswordHasher {
  constructor(private readonly configService: ConfigService) {}

  async hash(plain: string): Promise<string> {
    return await bcrypt.hash(
      plain,
      this.configService.getOrThrow<number>(ENV_KEY.SALT_ROUND),
    );
  }
  async compare(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
  }
}
