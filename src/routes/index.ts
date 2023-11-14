import express from 'express';
import { userRouter } from './user.route';
import { authRouter } from './auth.route';

const router = express.Router();

router.use('/api', userRouter);
router.use('/api', authRouter);

export { router };
