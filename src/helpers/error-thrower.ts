import { BadRequestError } from './errors/BadRequestError';
import { ForbiddenAccessError } from './errors/ForbiddenAccessError';
import { NotFoundError } from './errors/NotFoundError';
import { UnauthorizedError } from './errors/UnauthorizedError';

export function throwError(error: Error, serviceName: string) {
  if (
    error instanceof NotFoundError ||
    error instanceof BadRequestError ||
    error instanceof ForbiddenAccessError ||
    error instanceof UnauthorizedError
  ) {
    throw error;
  } else {
    throw new Error(`Something went wrong in the ${serviceName} service`);
  }
}
