import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error!');
    }
  }
}
