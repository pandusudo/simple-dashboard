export class ForbiddenAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenAccessError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
