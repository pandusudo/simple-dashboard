import { DtoMiddleware } from '../middlewares/dto.middleware';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RateLimiterMiddleware } from '../middlewares/rate-limiter.middleware';
import { AuthController } from '../controllers/auth.controller';
import express from 'express';

const authRouter = express.Router();

authRouter.post(
  '/auth/signup',
  RateLimiterMiddleware.checkRateLimit(30, 20),
  DtoMiddleware.validateSignupDto,
  AuthController.signup
);
authRouter.post(
  '/auth/signin',
  RateLimiterMiddleware.checkRateLimit(30, 20),
  DtoMiddleware.validateSigninDto,
  AuthController.signin
);
authRouter.post(
  '/auth/signin-google',
  DtoMiddleware.validateSigninGoogleDto,
  AuthController.signinGoogle
);
authRouter.post(
  '/auth/logout',
  AuthMiddleware.isAuthenticated,
  AuthController.logout
);

export { authRouter };
