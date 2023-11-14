import { UserController } from '../controllers/user.controller';
import express from 'express';

const userRouter = express.Router();

userRouter.get('/users', UserController.getAllUsers);

export { userRouter };
