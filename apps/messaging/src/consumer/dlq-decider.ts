import { IWorkerError } from '../types';

export class DlqDecider {
  shouldSendToDlq(
    error: unknown,
    attempt: number,
    maxAttempts: number,
  ): boolean {
    const isUnrecoverable = this.isUnrecoverableError(error);
    const hasExhaustedRetries = attempt === maxAttempts;

    return isUnrecoverable || hasExhaustedRetries;
  }

  getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }

  private isUnrecoverableError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    if (!('recoverable' in error)) {
      return false;
    }

    const recoverableValue = (error as IWorkerError).recoverable;

    if (typeof recoverableValue !== 'boolean') {
      return false;
    }

    return !recoverableValue;
  }
}
