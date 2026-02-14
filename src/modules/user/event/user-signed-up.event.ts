import { SignInType } from '@module/user/domain/user.entity';

import { DomainEvent } from '@common/base/base.domain-event';

interface UserSignedUpEventPayload {
  signInType: SignInType;
  username: string;
}

export class UserSignedUpEvent extends DomainEvent<UserSignedUpEventPayload> {
  readonly aggregate = 'User';
}
