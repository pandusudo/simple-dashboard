import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const users = await AuthService.signup(req.body);
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error!');
    }
  }
}
