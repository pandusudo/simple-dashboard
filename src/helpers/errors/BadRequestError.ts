import { ValidationError } from 'class-validator';

export class BadRequestError extends Error {
  constructor(message: string | ValidationError[]) {
    super(typeof message === 'string' ? message : JSON.stringify(message));

    this.name = 'BadRequestError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
