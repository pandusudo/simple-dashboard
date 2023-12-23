import { BadRequestError } from './errors/BadRequestError';
import { ForbiddenAccessError } from './errors/ForbiddenAccessError';
import { NotFoundError } from './errors/NotFoundError';
import { TooManyRequestsError } from './errors/TooManyRequestsError';
import { UnauthorizedError } from './errors/UnauthorizedError';

/**
 * The function `throwError` throws specific errors based on their type, or a generic error message if
 * the error type is unknown.
 * @param {Error} error - The error parameter is an instance of the Error class, which represents an
 * error object. It can be any type of error, including custom error classes like `NotFoundError`,
 * `BadRequestError`, `ForbiddenAccessError`, `TooManyRequestsError`, and `UnauthorizedError`.
 * @param {string} serviceName - The `serviceName` parameter is a string that represents the name of
 * the service where the error occurred. It is used to provide more specific information about the
 * error when throwing a generic error message.
 */
export function throwError(error: Error, serviceName: string) {
  if (
    error instanceof NotFoundError ||
    error instanceof BadRequestError ||
    error instanceof ForbiddenAccessError ||
    error instanceof UnauthorizedError ||
    error instanceof TooManyRequestsError
  ) {
    throw error;
  } else {
    throw new Error(`Something went wrong in the ${serviceName} service`);
  }
}
