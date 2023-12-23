import { Response } from 'express';
import { MetadataInterface } from '../interfaces/metadata.interface';
import { UnauthorizedError } from './errors/UnauthorizedError';
import { NotFoundError } from './errors/NotFoundError';
import { BadRequestError } from './errors/BadRequestError';
import { ForbiddenAccessError } from './errors/ForbiddenAccessError';
import { TooManyRequestsError } from './errors/TooManyRequestsError';
import { isJsonString } from './string';

export class ResponseHandler {
  static success<T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
    metadata?: MetadataInterface
  ): void {
    const responsePayload: any = {
      success: true,
      message,
      data,
    };

    if (metadata) {
      responsePayload.metadata = metadata;
    }

    res.status(statusCode).json(responsePayload);
  }

  static error(
    res: Response,
    statusCode: number,
    message: string | string[]
  ): void {
    res.status(statusCode).json({
      success: false,
      message,
    });
  }

  static handleBadRequestError(res: Response, error: BadRequestError) {
    const errorMessage = isJsonString(error.message)
      ? JSON.parse(error.message)
      : error.message;
    this.error(res, 400, errorMessage);
  }

  static handleUnauthorizedError(res: Response, error: UnauthorizedError) {
    this.error(res, 401, error.message);
  }

  static handleForbiddenAccessError(
    res: Response,
    error: ForbiddenAccessError
  ) {
    this.error(res, 403, error.message);
  }

  static handleNotFoundError(res: Response, error: NotFoundError) {
    this.error(res, 404, error.message);
  }

  static handleTooManyRequestsError(
    res: Response,
    error: TooManyRequestsError
  ) {
    this.error(res, 429, error.message);
  }

  static handleGenericError(res: Response, error: Error) {
    this.error(res, 500, error.message);
  }

  /**
   * The function `handleErrors` handles different types of errors and calls the appropriate error
   * handler based on the error type.
   * @param {Response} res - The `res` parameter is an instance of the `Response` class, which
   * represents the HTTP response that will be sent back to the client.
   * @param {Error} error - The `error` parameter is an instance of the `Error` class, which represents
   * an error that occurred during the execution of the code. It can be any type of error, such as an
   * `UnauthorizedError`, `NotFoundError`, `BadRequestError`, `ForbiddenAccessError`, or
   * `TooManyRequests
   */
  static handleErrors(res: Response, error: Error) {
    const errorHandlers: Record<string, (res: Response, error: Error) => void> =
      {
        UnauthorizedError: this.handleUnauthorizedError.bind(this, res),
        NotFoundError: this.handleNotFoundError.bind(this, res),
        BadRequestError: this.handleBadRequestError.bind(this, res),
        ForbiddenAccessError: this.handleForbiddenAccessError.bind(this, res),
        TooManyRequestsError: this.handleTooManyRequestsError.bind(this, res),
      };

    const errorHandler =
      errorHandlers[error.constructor.name] ||
      this.handleGenericError.bind(this, res);
    errorHandler(error);
  }
}
