import { AuthMiddleware } from '../middlewares/auth.middleware';
import { AuthController } from '../controllers/auth.controller';
import express from 'express';

const authRouter = express.Router();

authRouter.post(
  '/auth/signup',
  AuthMiddleware.signupMiddleware,
  AuthController.signup
);

export { authRouter };
