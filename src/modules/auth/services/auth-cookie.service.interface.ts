import { Response } from 'express';

import { AuthTokens } from '@module/auth/entities/auth-tokens.vo';

export const AUTH_COOKIE_SERVICE = Symbol('AUTH_COOKIE_SERVICE');

export interface IAuthCookieService {
  apply(res: Response, tokens: AuthTokens): void;
  clear(res: Response): void;
}
