import { BaseCommand } from '@common/base/base.command';

export interface CreateUserWithUsernameCommandProps {
  username: string;
  password: string;
}

export class CreateUserWithUsernameCommand extends BaseCommand {
  readonly username: string;
  readonly password: string;

  constructor(props: CreateUserWithUsernameCommandProps) {
    super();
    this.username = props.username;
    this.password = props.password;
  }
}
