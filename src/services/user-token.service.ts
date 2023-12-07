import { Prisma, prisma } from '../configs/prisma';
import { CreateUserTokenDTO } from '../dtos/user-token/create-user-token.dto';
import { UserToken } from '../custom-types/user-token';
import { throwError } from '../helpers/error-thrower';

export class UserTokenService {
  private static serviceName: string = 'User Token';
  static async getAll(): Promise<UserToken[]> {
    try {
      const userTokens = await prisma.userToken.findMany();
      return userTokens;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  static async create(payload: CreateUserTokenDTO): Promise<UserToken> {
    try {
      const userToken = await prisma.userToken.create({ data: payload });

      return userToken;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  static async findOneWhere(
    payload: Prisma.UserTokenWhereInput,
    orderBy: Prisma.UserTokenOrderByWithAggregationInput,
    includeUser: boolean = false
  ): Promise<UserToken> {
    try {
      const userToken = await prisma.userToken.findFirst({
        where: payload,
        orderBy,
        include: { user: includeUser },
      });

      return userToken;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  static async updateManyWhere(
    payload: Prisma.UserTokenWhereInput,
    data: Prisma.UserTokenUpdateInput
  ): Promise<void> {
    try {
      await prisma.userToken.updateMany({
        where: payload,
        data,
      });
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }
}
