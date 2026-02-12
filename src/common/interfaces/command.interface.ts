// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICommand {}

export interface ICommandHandler<TCommand extends ICommand, TResult> {
  execute(command: TCommand): Promise<TResult>;
}
