import { CustomError } from './custom-error';

export class UserNotFoundError extends CustomError {
  statusCode = 404;

  constructor() {
    super('User not found');

    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }

  serializeErrors() {
    return {
      statusCode: this.statusCode,
      message: 'User not Found'
    };
  }
}
