import { BaseCommand } from '@common/base/base.command';

export interface SignInWithUsernameCommandProps {
  username: string;
  password: string;
}

export class SignInWithUsernameCommand extends BaseCommand {
  readonly username: string;
  readonly password: string;

  constructor(props: SignInWithUsernameCommandProps) {
    super();

    this.username = props.username;
    this.password = props.password;
  }
}
