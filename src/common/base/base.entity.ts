import { TSID } from 'tsid-ts';

export type EntityId = string;

export const generateEntityId = () => TSID.create().number.toString();

export interface BaseEntityProps {
  id: EntityId;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateEntityProps<T> = {
  id: EntityId;
  props: T;
  createdAt?: Date;
  updatedAt?: Date;
};

export abstract class BaseEntity<T> {
  private readonly _id: EntityId;

  private readonly _createdAt: Date;

  protected _updatedAt: Date;

  protected readonly _props: T;

  constructor({ id, createdAt, updatedAt, props }: CreateEntityProps<T>) {
    const now = new Date();

    this._id = id;
    this._createdAt = createdAt || now;
    this._updatedAt = updatedAt || now;
    this._props = props;
    this.validate();
  }

  get id() {
    return this._id;
  }

  protected get props(): T {
    return this._props;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  set updatedAt(value: Date) {
    this._updatedAt = value;
  }

  getProps() {
    return {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...this.props,
    };
  }

  public abstract validate(): void;
}
