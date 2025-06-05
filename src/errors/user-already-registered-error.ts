import { CustomError } from './custom-error';

export class UserAlreadyRegisteredError extends CustomError {
  statusCode = 403;
  reason = 'User already registered';

  constructor(error?: string) {
    super('User already registered');
    if(error){
      this.reason = error;
    }
    Object.setPrototypeOf(this, UserAlreadyRegisteredError.prototype);
  }

  serializeErrors() {
    return {
      statusCode: this.statusCode,
      message: this.reason
    };
  }
}
