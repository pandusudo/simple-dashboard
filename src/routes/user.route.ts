import { DtoMiddleware } from '../middlewares/dto.middleware';
import { UserController } from '../controllers/user.controller';
import express from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { UserMiddleware } from '../middlewares/user.middleware';

const userRouter = express.Router();

userRouter.get(
  '/users',
  AuthMiddleware.isAuthenticated,
  UserMiddleware.isVerified,
  UserController.getAllUsers
);
userRouter.get(
  '/users/dashboard',
  AuthMiddleware.isAuthenticated,
  UserMiddleware.isVerified,
  UserController.getUserDashboard
);
userRouter.get(
  '/users/profile',
  AuthMiddleware.isAuthenticated,
  UserMiddleware.isVerified,
  UserController.getUserProfile
);
userRouter.post(
  '/users/verify-email',
  DtoMiddleware.validateVerifyEmailDto,
  UserController.verifyEmail
);
userRouter.post(
  '/users/resend-email-verification',
  AuthMiddleware.isAuthenticated,
  UserController.resendVerifyEmail
);
userRouter.get(
  '/users/check-session',
  AuthMiddleware.isAuthenticated,
  UserController.checkSession
);

export { userRouter };
