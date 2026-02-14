import { UserSignedUpEvent } from '@module/user/event/user-signed-up.event';

import {
  AggregateRoot,
  CreateEntityProps,
  generateEntityId,
} from '@common/base/base.entity';

export enum SignInType {
  username = 'username',
}

export interface UserProps {
  signInType: SignInType;
  username: string;
  password: string;
}

export interface CreateWithUsernameProps {
  username: string;
  hashedPassword: string;
}

export class User extends AggregateRoot<UserProps> {
  constructor(props: CreateEntityProps<UserProps>) {
    super(props);
  }

  static createWithUsername(props: CreateWithUsernameProps) {
    const id = generateEntityId();
    const now = new Date();

    const user = new User({
      id,
      props: {
        signInType: SignInType.username,
        username: props.username,
        password: props.hashedPassword,
      },
      createdAt: now,
      updatedAt: now,
    });

    user.apply(
      new UserSignedUpEvent(user.id, {
        signInType: user.signInType,
        username: user.username,
      }),
    );

    return user;
  }

  get signInType() {
    return this.props.signInType;
  }

  get username() {
    return this.props.username;
  }

  get password() {
    return this.props.password;
  }

  public validate(): void {}
}
