import { Prisma, prisma } from '../configs/prisma';
import { CreateUserTokenDTO } from '../dtos/user-token/create-user-token.dto';
import { UserToken } from '../custom-types/user-token';
import { throwError } from '../helpers/error-thrower';

export class UserTokenService {
  // Descriptive name for the service
  private static serviceName: string = 'User Token';

  /**
   * The function retrieves all user tokens from a database
   * using Prisma and returns them as an array of `UserToken` objects.
   * @returns an array of UserToken objects.
   */
  static async getAll(): Promise<UserToken[]> {
    try {
      const userTokens = await prisma.userToken.findMany();
      return userTokens;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  /**
   * The function creates a user token using the provided payload data.
   * @param {CreateUserTokenDTO} payload - The payload parameter is an object of type
   * CreateUserTokenDTO. It contains the data needed to create a new user token.
   * @returns The `create` function is returning a `Promise` that resolves to a `UserToken` object.
   */
  static async create(payload: CreateUserTokenDTO): Promise<UserToken> {
    try {
      const userToken = await prisma.userToken.create({ data: payload });

      return userToken;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  /**
   * The function `findOneWhere` is a static async function that finds a user token based on a given
   * payload and orderBy criteria, and includes the user if specified.
   * @param payload - The `payload` parameter is an object that specifies the conditions for finding a
   * user token. It is of type `Prisma.UserTokenWhereInput`, which is a Prisma input type that allows
   * you to specify various conditions such as equality, inequality, and logical operators for
   * filtering the user tokens.
   * @param orderBy - The `orderBy` parameter is used to specify the sorting order of the results. It
   * is of type `Prisma.UserTokenOrderByWithAggregationInput`, which is an input object type provided
   * by Prisma. This type allows you to specify the fields by which you want to order the results and
   * the
   * @param {boolean} [includeUser=false] - The `includeUser` parameter is a boolean value that
   * determines whether to include the associated `user` object in the result. If `includeUser` is set
   * to `true`, the `user` object will be included in the result. If it is set to `false` (default
   * value),
   * @returns a `Promise` that resolves to a `UserToken` object.
   */
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

  /**
   * The function updates multiple user tokens in the database based on a given condition and new data.
   * @param payload - The `payload` parameter is an object that specifies the conditions for selecting
   * the user tokens to be updated. It is of type `Prisma.UserTokenWhereInput`, which is a Prisma input
   * type used for filtering records based on certain criteria.
   * @param data - The `data` parameter is an object that contains the fields and values that you want
   * to update for the user tokens that match the specified `payload` condition.
   */
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
