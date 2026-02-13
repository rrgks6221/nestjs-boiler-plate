import { BaseValueObject } from '@common/base/base.value-object';

export type AuthTokenType = 'access' | 'refresh';

export interface AuthTokenProps {
  token: string;
  type: AuthTokenType;
  expiresAt: Date;
}

export class AuthToken extends BaseValueObject<AuthTokenProps> {
  constructor(props: AuthTokenProps) {
    super(props);
  }

  get token(): string {
    return this.props.token;
  }

  get type(): AuthTokenType {
    return this.props.type;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected validate(props: AuthTokenProps): void {}
}
