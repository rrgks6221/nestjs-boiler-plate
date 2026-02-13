import { AuthTokens } from '@module/auth/entities/auth-tokens.vo';

export const AUTH_TOKEN_SERVICE = Symbol('AUTH_TOKEN_SERVICE');

export interface IAuthTokenService {
  createTokens(userId: string): AuthTokens;
}
