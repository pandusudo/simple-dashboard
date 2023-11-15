import { SignupDTO } from '../dtos/auth/signup.dto';
import { NextFunction, Request, Response } from 'express';
import { validateDto } from '../helpers/dto-validator';

export class AuthMiddleware {
  static async signupMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const errors = await validateDto(SignupDTO, req.body);
    if (errors.length > 0) {
      res.status(400).json(errors);
    } else {
      next();
    }
  }
}
