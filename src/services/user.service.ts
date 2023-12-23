import { prisma, Prisma } from '../configs/prisma';
import { exclude } from '../helpers/prisma-helper';
import { User } from '../custom-types/user';
import { SessionService } from './sessions.service';
import { generateRandomString } from '../helpers/string';
import { decryptWithCipher, encryptWithCipher } from '../helpers/encrypt';
import { EmailService } from './mail.service';
import { UserTokenService } from './user-token.service';
import { VerifyEmailUserDTO } from '../dtos/user/verify-email-user.dto';
import { NotFoundError } from '../helpers/errors/NotFoundError';
import { BadRequestError } from '../helpers/errors/BadRequestError';
import { hashWithCrypto, validateBcryptHash } from '../helpers/hash';
import { QueryDTO } from '../dtos/query.dto';
import { UpdateUserDTO } from '../dtos/user/edit-user.dto';
import { sessionConfig, userTokenConfig } from '../configs/common';
import { Session } from '../custom-types/session';
import { throwError } from '../helpers/error-thrower';
import { MetadataInterface } from '../interfaces/metadata.interface';
import { UnauthorizedError } from '../helpers/errors/UnauthorizedError';

export class UserService {
  // Descriptive name for the service
  private static serviceName: string = 'User';

  /**
   * The function `getUserDashboard` retrieves statistics about the total number of users, active users
   * today, and average active users over the last 7 days.
   * @returns The function `getUserDashboard` returns an object with the following properties:
   */
  static async getUserDashboard(): Promise<{
    total_users: number;
    active_users_today: number;
    average_active_users_last_7_days: string;
  }> {
    const totalUsers = await prisma.user.count();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const currentDate = new Date();

    const activeUsersToday = await prisma.session.findMany({
      where: {
        created_at: {
          gte: startOfDay,
        },
        expired_at: {
          gt: currentDate,
        },
        user: {
          is_logged_in: true,
        },
      },
      distinct: ['user_id'],
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const averageActiveSessionUsers = await prisma.session.groupBy({
      by: ['created_at', 'user_id'],
      where: {
        session_start: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        user_id: true,
      },
    });

    const userIdSet = new Set();
    const totalDays = 7;
    const totalActiveUsers = averageActiveSessionUsers.reduce((sum, entry) => {
      const keyset = `${entry.user_id}-${new Date(
        entry.created_at
      ).toLocaleDateString()}`;
      if (userIdSet.has(keyset)) {
        return sum + 0;
      } else {
        userIdSet.add(keyset);
        return sum + 1;
      }
    }, 0);
    const averageActiveSessionUsersLast7Days =
      totalDays > 0 ? totalActiveUsers / totalDays : 0;

    return {
      total_users: totalUsers,
      active_users_today: activeUsersToday.length,
      average_active_users_last_7_days:
        averageActiveSessionUsersLast7Days.toFixed(2),
    };
  }

  /**
   * The function retrieves a list of users from a
   * database, with pagination and metadata.
   * @param {QueryDTO} payload - The payload parameter is an object of type QueryDTO. It contains the
   * following properties:
   * @returns an object with two properties: `users` and `metadata`.
   */
  static async getAll(
    payload: QueryDTO
  ): Promise<{ users: Partial<User>[]; metadata: MetadataInterface }> {
    let { page, limit } = payload;

    // check if the page or limit is less than 1. if true, change the page or limit to the default value.
    page = page >= 1 ? Number(page) : 1;
    limit = limit >= 1 ? Number(limit) : 10;

    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          last_session: true,
          login_counter: true,
          signed_up_at: true,
        },
        take: limit,
        skip: (page - 1) * limit,
      });
      const totalUsers = await prisma.user.count();

      const metadata: MetadataInterface = {
        page,
        limit,
        totalCount: totalUsers,
      };

      return { users, metadata };
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  /**
   * The function creates a new user in the database and returns the created user object with the
   * password excluded.
   * @param payload - The `payload` parameter is an object of type `Prisma.UserCreateInput`. It
   * contains the data needed to create a new user.
   * @returns a `Promise` that resolves to a Partial `User` object.
   */
  static async create(payload: Prisma.UserCreateInput): Promise<Partial<User>> {
    try {
      const user = await prisma.user.create({ data: payload });

      return exclude(user, ['password']);
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  /**
   * The `update` function updates a user's information in the database and returns the updated user.
   * @param {number} id - The `id` parameter is a number that represents the unique identifier of the
   * user that needs to be updated.
   * @param {UpdateUserDTO | { password: string }} payload - The `payload` parameter can be of two
   * types:
   * @returns a Promise that resolves to a Partial<User> object.
   */
  static async update(
    id: number,
    payload: UpdateUserDTO | { password: string }
  ): Promise<Partial<User>> {
    try {
      await prisma.user.update({ where: { id }, data: payload });

      const user = await this.findOneWhere({ id });

      return user;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  /**
   * The function `validateOldPassword` is used to validate if a given password matches the old
   * password of a user with a specific ID.
   * @param {number} id - The id parameter is the unique identifier of the user whose password needs to
   * be validated. It is of type number.
   * @param {string} password - The `password` parameter is a string that represents the old password
   * that needs to be validated.
   */
  static async validateOldPassword(
    id: number,
    password: string
  ): Promise<void> {
    try {
      const includePassword = true;
      const user = await UserService.findOneWhere(
        {
          id,
        },
        includePassword
      );

      if (!user || !user.password)
        throw new UnauthorizedError('Invalid old password!');

      const isCorrectPassword = await validateBcryptHash(
        password,
        user.password
      );

      if (!isCorrectPassword)
        throw new UnauthorizedError('Invalid old password!');
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  /**
   * The function updates a user in the database based on a unique input and returns the updated user.
   * @param payload - The `payload` parameter is an object that specifies the unique identifier of the
   * user you want to update. It typically contains properties such as `id` or `email` that uniquely
   * identify the user in the database.
   * @param data - The `data` parameter is an object that contains the fields and values that you want
   * to update for the user. It should be of type `Prisma.UserUpdateInput`, which is a generated type
   * based on your Prisma schema. This object should have the same structure as your user model, with
   * @returns a Promise that resolves to a User object.
   */
  static async updateWhere(
    payload: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: payload,
        data,
      });

      return user;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  /**
   * The function `findOneWhere` finds a user based on a given payload and
   * returns the user object, excluding the password if `includePassword` is set to false.
   * @param payload - The `payload` parameter is an object that represents the conditions to be used in
   * the `WHERE` clause of the database query. It is of type `Prisma.UserWhereInput`, which is a
   * Prisma-generated type that defines the available fields and operators for filtering the `User`
   * model.
   * @param {boolean} [includePassword=false] - The `includePassword` parameter is a boolean flag that
   * determines whether the `password` field should be included in the returned user object. By
   * default, it is set to `false`, meaning that the `password` field will be excluded from the
   * returned user object.
   * @returns a `Promise` that resolves to a Partial `User` object.
   */
  static async findOneWhere(
    payload: Prisma.UserWhereInput,
    includePassword: boolean = false
  ): Promise<Partial<User>> {
    try {
      const user = await prisma.user.findFirst({
        where: payload,
      });

      if (user && !includePassword) return exclude(user, ['password']);

      return user;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  /**
   * The function `resendVerifyEmail` sends a verification email to a user, deactivates all previous
   * verification tokens for the user, and creates a new verification token.
   * @param user - The `user` parameter is an object that represents a user. It contains the following
   * properties:
   */
  static async resendVerifyEmail(user: Partial<User>): Promise<void> {
    try {
      const token = generateRandomString();
      const encryptedToken = encryptWithCipher(token);

      EmailService.sendVerificationEmail(user.email, user.name, encryptedToken);

      // deactivate all email verification tokens for this user
      await UserTokenService.updateManyWhere(
        { user_id: user.id },
        { active: false }
      );

      const currentDate = new Date();
      const expiryDate = userTokenConfig.getExpiryDate(currentDate);

      await UserTokenService.create({
        user_id: user.id,
        token,
        expired_at: expiryDate,
        type: 'email-verification',
        active: true,
      });
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  /**
   * The `verifyEmail` function verifies the email of a user by decrypting a token, checking its
   * validity, updating user information, creating a new session if necessary, and deactivating all
   * email verification tokens for the user.
   * @param {VerifyEmailUserDTO} payload - The `payload` parameter is an object that contains the
   * necessary information for verifying an email. It typically includes a `token` property, which is a
   * token received from the user for email verification.
   * @param {string} [oldHashedSessionId=null] - The `oldHashedSessionId` parameter is a string that
   * represents the hashed session ID of the user's previous session. It is an optional parameter and
   * its default value is `null`.
   * @returns an object with the following properties:
   */
  static async verifyEmail(
    payload: VerifyEmailUserDTO,
    oldHashedSessionId: string = null
  ): Promise<{
    user: User;
    session: Session;
    hashedSessionId: string;
    isDifferentUser: boolean;
  }> {
    try {
      // Decrypt the token received in the payload
      const token = decryptWithCipher(payload.token);

      // Set the flag to include user information in the query result
      const includeUser = true;

      // Find the user token based on the decrypted token
      const userToken = await UserTokenService.findOneWhere(
        {
          token,
          type: 'email-verification',
        },
        { created_at: 'desc' },
        includeUser
      );

      // Throw an error if the user token doesn't exist
      if (!userToken) {
        throw new NotFoundError("Your token doesn't exist");
      }

      // Check if the token is expired or inactive
      const currentDate = new Date();
      const isExpired = currentDate > userToken.expired_at;
      const isInactive = !userToken.active;

      // Throw an error if the token is expired or inactive
      if (isExpired || isInactive) {
        throw new BadRequestError(
          JSON.stringify({ message: 'Your token is expired' })
        );
      }

      // Initialize variables for old session and user
      let oldSession: Session = null;
      if (oldHashedSessionId) {
        oldSession = await SessionService.findOneWhere(
          { hashed_session_id: oldHashedSessionId },
          { created_at: 'desc' }
        );
      }

      let user: User;
      let session: Session;
      let hashedSessionId: string;
      let isDifferentUser: boolean = false;

      // If an old session exists, update user information
      if (oldSession) {
        user = await this.updateWhere(
          { id: userToken.user_id },
          { verified_at: currentDate }
        );
        isDifferentUser = oldSession.user_id != userToken.user_id;
        hashedSessionId = oldHashedSessionId;
        session = oldSession;
      } else {
        // If no old session exists, update user information and create a new session
        user = await this.updateWhere(
          { id: userToken.user_id },
          {
            verified_at: currentDate,
            login_counter: userToken.user.login_counter + 1,
            last_session: currentDate,
            signed_in_at: currentDate,
            is_logged_in: true,
          }
        );

        // Generate a hashed session ID for the new session
        hashedSessionId = hashWithCrypto(JSON.stringify({ id: user.id }));

        // Set the expiry date for the new session
        const expiryDate = sessionConfig.getExpiryDate(currentDate);

        // Create a new session
        session = await SessionService.create({
          user_id: user.id,
          expired_at: expiryDate,
          session_start: currentDate,
          hashed_session_id: hashedSessionId,
        });
      }

      // Deactivate all email verification tokens for this user
      await UserTokenService.updateManyWhere(
        { user_id: user.id },
        { active: false }
      );

      // Return the updated user and session information
      return {
        user,
        session,
        hashedSessionId,
        isDifferentUser,
      };
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }
}
