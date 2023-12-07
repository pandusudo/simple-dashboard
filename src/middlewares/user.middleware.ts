import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../helpers/response-handler';
import { ForbiddenAccessError } from '../helpers/errors/ForbiddenAccessError';

export class UserMiddleware {
  static async isVerified(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const isVerified = req.user.verified_at;

    if (!isVerified) {
      ResponseHandler.handleErrors(
        res,
        new ForbiddenAccessError('Email verification required')
      );
    } else {
      next();
    }
  }
}
