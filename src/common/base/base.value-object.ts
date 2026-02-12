export abstract class BaseValueObject<IProps> {
  protected readonly props: IProps;

  constructor(props: IProps) {
    this.validate(props);
    this.props = props;
  }

  getProps(): IProps {
    return JSON.parse(JSON.stringify(this.props)) as IProps;
  }

  protected abstract validate(props: IProps): void;
}
