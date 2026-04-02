export abstract class WorkerError extends Error {
  abstract readonly recoverable: boolean;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends WorkerError {
  readonly recoverable = false;

  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}

export class TransientError extends WorkerError {
  readonly recoverable = true;

  constructor(message: string) {
    super(message);
  }
}

export enum ErrorCodes {
  ALREADY_PROCESSED = 'ALREADY_PROCESSED',
  REDIS_ERROR = 'REDIS_ERROR',
  DB_ERROR = 'DB_ERROR',
}
