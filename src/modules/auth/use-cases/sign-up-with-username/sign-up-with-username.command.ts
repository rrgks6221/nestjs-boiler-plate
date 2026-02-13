import { BaseCommand } from '@common/base/base.command';

export interface SignUpWithUsernameCommandProps {
  username: string;
  password: string;
}

export class SignUpWithUsernameCommand extends BaseCommand {
  readonly username: string;
  readonly password: string;

  constructor(props: SignUpWithUsernameCommandProps) {
    super();

    this.username = props.username;
    this.password = props.password;
  }
}
