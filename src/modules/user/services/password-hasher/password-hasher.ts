import { Injectable } from '@nestjs/common';

import bcrypt from 'bcrypt';

import { IPasswordHasher } from '@module/user/services/password-hasher/password-hasher.interface';

@Injectable()
export class PasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return await bcrypt.hash(plain, Number(process.env.SLAT_ROUND));
  }
  async compare(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
  }
}
