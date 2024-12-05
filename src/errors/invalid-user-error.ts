import { CustomError } from './custom-error';

export class InvalidUserError extends CustomError {
  statusCode = 400;
  reason: string;

  constructor(reason: string) {
    super('Invalid user');
    this.reason = reason;

    Object.setPrototypeOf(this, InvalidUserError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
