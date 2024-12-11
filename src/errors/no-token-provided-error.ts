import { CustomError } from './custom-error';

export class NoTokenProvidedError extends CustomError {
  statusCode = 401;

  constructor() {
    super('No token provided');

    Object.setPrototypeOf(this, NoTokenProvidedError.prototype);
  }

  serializeErrors() {
    return [{ message: 'No token provided' }];
  }
}
