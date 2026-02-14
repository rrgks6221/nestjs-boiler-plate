import { SignInType } from '@module/user/domain/user.entity';

import { DomainEvent } from '@common/base/base.domain-event';

interface UserSignedInEventPayload {
  signInType: SignInType;
  username: string;
}

export class UserSignedInEvent extends DomainEvent<UserSignedInEventPayload> {
  readonly aggregate = 'User';
}
