import { PrismaClient, users } from '@prisma/client';
import { CreateUserDTO } from '../dtos/user/create-user.dto';
import { exclude } from '../helpers/prisma-helper';

const prisma = new PrismaClient();

export class UserService {
  private static ServiceName = 'User';
  static async getAllUsers(): Promise<users[]> {
    const users = await prisma.users.findMany();
    return users;
  }

  static async createUser(
    payload: CreateUserDTO
  ): Promise<Omit<users, 'password'>> {
    try {
      const user = await prisma.users.create({ data: payload });

      return exclude(user, ['password']);
    } catch (error) {
      throw new Error(
        `Something went wrong in the ${this.ServiceName} service`
      );
    }
  }

  static async findOneBy(
    payload: {
      [x: string]: any;
    },
    excludePassword: boolean = false
  ): Promise<users | Omit<users, 'password'>> {
    try {
      const user = await prisma.users.findFirst({
        where: payload,
      });

      if (user && !excludePassword) exclude(user, ['password']);

      return user;
    } catch (error) {
      throw new Error('Something went wrong in the service');
    }
  }
}
