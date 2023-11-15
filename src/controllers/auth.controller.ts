import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ResponseHandler } from '../helpers/response-handler';

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
      res.status(500).send('Internal Server Error!');
    }
  }
}
