import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ResponseHandler } from '../helpers/response-handler';
import { cookieSettings } from '../configs/cookie';

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      await AuthService.signup(req.body);
      ResponseHandler.success(
        res,
        200,
        'Verification email sent. Please check your email to verify your address before using the app.'
      );
    } catch (error) {
      ResponseHandler.handleErrors(res, error);
    }
  }

  static async signin(req: Request, res: Response): Promise<void> {
    try {
      const data = await AuthService.signin(req.body);
      const { hashedSessionId, expiryDate, ...result } = data;
      res.cookie('session_id', hashedSessionId, cookieSettings);
      ResponseHandler.success(res, 200, "You're signed in!", result);
    } catch (error) {
      ResponseHandler.handleErrors(res, error);
    }
  }

  static async signinGoogle(req: Request, res: Response): Promise<void> {
    try {
      const data = await AuthService.signinGoogle(req.body);
      const { hashedSessionId, expiryDate, ...result } = data;

      res.cookie('session_id', hashedSessionId, cookieSettings);
      ResponseHandler.success(res, 200, "You're signed in!", result);
    } catch (error) {
      ResponseHandler.handleErrors(res, error);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const id = req.user.id;
      await AuthService.logout(id);

      res.clearCookie('session_id', cookieSettings);

      ResponseHandler.success(res, 200, "You're logged out!");
    } catch (error) {
      ResponseHandler.handleErrors(res, error);
    }
  }
}
