import express, { Request, Response } from 'express';
import { userRouter } from './user.route';
import { authRouter } from './auth.route';

const router = express.Router();

router.use('/api', userRouter);
router.use('/api', authRouter);
router.get('/api/healthcheck', (req: Request, res: Response) => {
  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date(),
  };

  res.status(200).send(data);
});

export { router };
