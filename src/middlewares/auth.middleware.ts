import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../helpers/response-handler';
import { SessionService } from '../services/sessions.service';
import { UnauthorizedError } from '../helpers/errors/UnauthorizedError';
import { cookieSettings } from '../configs/cookie';

export class AuthMiddleware {
  static async isAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const hashedSessionId = req.cookies?.session_id;

    try {
      // check auth and session status
      const session = await SessionService.checkAuthSession(hashedSessionId);

      req.session = {
        id: session.id,
        expired_at: session.expired_at,
      };
      req.user = {
        id: session.user_id,
        name: session.user.name,
        email: session.user.email,
        verified_at: session.user.verified_at,
      };

      // if new session created, update session id cookie with the new session id
      if (hashedSessionId !== session.hashed_session_id)
        res.cookie('session_id', session.hashed_session_id, cookieSettings);

      next();
    } catch (error) {
      if (error instanceof UnauthorizedError && req.cookies.session_id) {
        res.clearCookie('session_id');
      }
      ResponseHandler.handleErrors(res, error);
    }
  }
}
