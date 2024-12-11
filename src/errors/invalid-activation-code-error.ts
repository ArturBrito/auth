import { CustomError } from './custom-error';

export class InvalidActivationCode extends CustomError {
  statusCode = 400;

  constructor() {
    super('Invalid activation code');

    Object.setPrototypeOf(this, InvalidActivationCode.prototype);
  }

  serializeErrors() {
    return [{ message: 'Invalid activation code' }];
  }
}
