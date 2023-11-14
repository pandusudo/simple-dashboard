import { PrismaClient } from '@prisma/client';
import { UserInterface } from '../interfaces/user.interface';
import { CreateUserDTO } from '../dtos/user/create-user.dto';
import { exclude } from '../helpers/prisma-helper';

const prisma = new PrismaClient();

export class UserService {
  static async getAllUsers(): Promise<UserInterface[]> {
    const users = await prisma.users.findMany();
    return users;
  }

  static async createUser(payload: CreateUserDTO): Promise<UserInterface> {
    try {
      const user = await prisma.users.create({ data: payload });

      return exclude(user, ['password']);
    } catch (error) {
      console.error(error);
    }
  }

  static async findOneBy(payload: {
    [x: string]: any;
  }): Promise<UserInterface> {
    try {
      const user = await prisma.users.findFirst({
        where: payload,
      });

      return exclude(user, ['password']);
    } catch (error) {
      console.error(error);
    }
  }
}
