import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  reason = 'Server problem';

  constructor() {
    super('Server problem');

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return {
      statusCode: this.statusCode,
      message: this.reason
    };
  }
}
