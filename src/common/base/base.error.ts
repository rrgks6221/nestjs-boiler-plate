import { randomUUID } from 'crypto';
import { ClsServiceManager } from 'nestjs-cls';

export interface BaseSerializedError {
  message: string;
  code: string;
  correlationId: string;
  stack?: string;
  cause?: string;
  metadata?: unknown;
}

export abstract class BaseError extends Error {
  public readonly correlationId: string;

  constructor(
    readonly message: string,
    readonly code: string,
    readonly cause?: Error,
    readonly metadata?: unknown,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.correlationId =
      ClsServiceManager.getClsService().getId() ?? randomUUID();
  }

  toJSON(): BaseSerializedError {
    return {
      message: this.message,
      code: this.code,
      stack: this.stack,
      correlationId: this.correlationId,
      cause: JSON.stringify(this.cause),
      metadata: this.metadata,
    };
  }
}

export class UnauthorizedError extends BaseError {
  static CODE: string = 'COMMON.UNAUTHORIZED';

  constructor(message?: string) {
    super(message ?? 'Unauthorized can not access', UnauthorizedError.CODE);
  }
}

export class RequestValidationError extends BaseError {
  static CODE = 'COMMON.REQUEST_VALIDATION_ERROR';

  constructor(message?: string) {
    super(
      message ?? 'request input validation error',
      RequestValidationError.CODE,
    );
  }
}

export class InternalServerError extends BaseError {
  static CODE = 'COMMON.INTERNAL_SERVER_ERROR';

  constructor(message?: string) {
    super(message ?? 'Internal server error', InternalServerError.CODE);
  }
}

export class UniqueConstraintViolationError extends BaseError {
  static CODE = 'COMMON.UNIQUE_CONSTRAINT_VIOLATION';

  constructor(message?: string) {
    super(
      message ?? 'Unique constraint violation',
      UniqueConstraintViolationError.CODE,
    );
  }
}
