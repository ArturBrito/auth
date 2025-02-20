import { CustomError } from './custom-error';

export class InvalidTokenError extends CustomError {
  statusCode = 404;

  constructor() {
    super('Invalid token');

    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Invalid token' }];
  }
}
