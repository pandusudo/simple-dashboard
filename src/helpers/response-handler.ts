import { Response } from 'express';
import { MetadataInterface } from '../interfaces/metadata.interface';
import { UnauthorizedError } from './errors/UnauthorizedError';
import { NotFoundError } from './errors/NotFoundError';
import { BadRequestError } from './errors/BadRequestError';
import { ForbiddenAccessError } from './errors/ForbiddenAccessError';
import { TooManyRequestsError } from './errors/TooManyRequestsError';

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
    this.error(res, 400, JSON.parse(error.message));
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
