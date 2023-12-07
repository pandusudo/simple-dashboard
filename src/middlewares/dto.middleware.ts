import { SignupDTO } from '../dtos/auth/signup.dto';
import { NextFunction, Request, Response } from 'express';
import { validateDto } from '../helpers/dto-validator';
import { SigninDTO } from '../dtos/auth/signin.dto';
import { ResponseHandler } from '../helpers/response-handler';
import { VerifyEmailUserDTO } from '../dtos/user/verify-email-user.dto';
import { BadRequestError } from '../helpers/errors/BadRequestError';
import { SigninGoogleDTO } from '../dtos/auth/signin-google.dto';

export class DtoMiddleware {
  static async validateSignupDto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const errors = await validateDto(SignupDTO, req.body);
    if (errors.length > 0) {
      ResponseHandler.handleErrors(res, new BadRequestError(errors));
    } else {
      next();
    }
  }

  static async validateSigninDto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const errors = await validateDto(SigninDTO, req.body);
    if (errors.length > 0) {
      ResponseHandler.handleErrors(res, new BadRequestError(errors));
    } else {
      next();
    }
  }

  static async validateSigninGoogleDto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const errors = await validateDto(SigninGoogleDTO, req.body);
    if (errors.length > 0) {
      ResponseHandler.handleErrors(res, new BadRequestError(errors));
    } else {
      next();
    }
  }

  static async validateVerifyEmailDto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const errors = await validateDto(VerifyEmailUserDTO, req.body);
    if (errors.length > 0) {
      ResponseHandler.handleErrors(res, new BadRequestError(errors));
    } else {
      next();
    }
  }
}
