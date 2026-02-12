import { BaseCommand } from '@common/base/base.command';

export interface ICommandHandler<TCommand extends BaseCommand, TResult> {
  execute(command: TCommand): Promise<TResult>;
}
