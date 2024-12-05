import { CustomError } from './custom-error';

export class InactiveUserError extends CustomError {
  statusCode = 400;

  constructor() {
    super('User is inactive');

    Object.setPrototypeOf(this, InactiveUserError.prototype);
  }

  serializeErrors() {
    return [{ message: 'User is inactive' }];
  }
}
