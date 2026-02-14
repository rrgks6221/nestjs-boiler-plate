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

    return new User({
      id,
      props: {
        signInType: SignInType.username,
        username: props.username,
        password: props.hashedPassword,
      },
      createdAt: now,
      updatedAt: now,
    });
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
