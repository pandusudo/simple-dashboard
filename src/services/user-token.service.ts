import { PrismaClient, user_tokens } from '@prisma/client';
import { CreateUserTokenDto } from 'dtos/user-token/create-user-token.dto';

const prisma = new PrismaClient();

export class UserTokenService {
  private static ServiceName = 'User Token';
  static async getAllUserTokens(): Promise<user_tokens[]> {
    const userTokens = await prisma.user_tokens.findMany();
    return userTokens;
  }

  static async createUserToken(
    payload: CreateUserTokenDto
  ): Promise<user_tokens> {
    try {
      const userToken = await prisma.user_tokens.create({ data: payload });

      return userToken;
    } catch (error) {
      throw new Error(
        `Something went wrong in the ${this.ServiceName} service`
      );
    }
  }

  static async findOneBy(payload: { [x: string]: any }): Promise<user_tokens> {
    try {
      const userToken = await prisma.user_tokens.findFirst({
        where: payload,
      });

      return userToken;
    } catch (error) {
      throw new Error('Something went wrong in the service');
    }
  }
}
