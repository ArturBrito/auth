import { CustomError } from './custom-error';

export class UserAlreadyRegisteredError extends CustomError {
  statusCode = 403;
  reason = 'User already registered';

  constructor() {
    super('User already registered');

    Object.setPrototypeOf(this, UserAlreadyRegisteredError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
