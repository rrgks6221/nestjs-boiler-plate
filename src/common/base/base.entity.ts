import { AggregateRoot as NestAggregateRoot } from '@nestjs/cqrs';

import { TSID } from 'tsid-ts';

import { DomainEvent } from '@common/base/base.domain-event';

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

export type TBaseEntity<T> = BaseEntity<T> | AggregateRoot<T>;

export class OffsetPage<T> {
  constructor(
    public readonly data: T[],
    public readonly currentPage: number,
    public readonly perPage: number,
    public readonly totalCount: number,
  ) {}

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.perPage);
  }
}

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
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...this.props,
    };
  }

  public abstract validate(): void;
}

/**
 * @description 2개 이상의 추상클래스를 상속받을 수 없기에 BaseEntity와 동일한 구현을 포함함
 */
export abstract class AggregateRoot<T> extends NestAggregateRoot<DomainEvent> {
  private readonly _id: EntityId;

  private readonly _createdAt: Date;

  protected _updatedAt: Date;

  protected readonly _props: T;

  constructor({ id, createdAt, updatedAt, props }: CreateEntityProps<T>) {
    super();

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
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...this.props,
    };
  }

  public abstract validate(): void;
}
