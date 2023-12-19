import { rateLimit } from 'express-rate-limit';
import { TooManyRequestsError } from '../helpers/errors/TooManyRequestsError';
import { ResponseHandler } from '../helpers/response-handler';

export class RateLimiterMiddleware {
  static checkRateLimit = (duration: number, limit: number) => {
    return rateLimit({
      windowMs: duration * 60 * 1000, // minutes
      limit,
      message: `Please try again ${duration} minutes later`,
      standardHeaders: 'draft-7',
      handler: (req: any, res: any) => {
        ResponseHandler.handleErrors(
          res,
          new TooManyRequestsError(`Please try again ${duration} minutes later`)
        );
      },
    });
  };
}
