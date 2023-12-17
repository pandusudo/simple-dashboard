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
  private static serviceName: string = 'User';

  static async getUserDashboard(): Promise<any> {
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

  static async create(payload: Prisma.UserCreateInput): Promise<Partial<User>> {
    try {
      const user = await prisma.user.create({ data: payload });

      return exclude(user, ['password']);
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

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
      const token = decryptWithCipher(payload.token);
      const includeUser = true;
      const userToken = await UserTokenService.findOneWhere(
        {
          token,
          type: 'email-verification',
        },
        { created_at: 'desc' },
        includeUser
      );

      if (!userToken) throw new NotFoundError("Your token doesn't exist");

      const currentDate = new Date();
      const isExpired = currentDate > userToken.expired_at;
      const isInactive = !userToken.active;

      if (isExpired || isInactive)
        throw new BadRequestError(
          JSON.stringify({ message: 'Your token is expired' })
        );

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

      if (oldSession) {
        user = await this.updateWhere(
          { id: userToken.user_id },
          { verified_at: currentDate }
        );
        isDifferentUser = oldSession.user_id != userToken.user_id;
        hashedSessionId = oldHashedSessionId;
        session = oldSession;
      } else {
        // update verified at and increase the login counter for the user
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

        hashedSessionId = hashWithCrypto(JSON.stringify({ id: user.id }));
        const expiryDate = sessionConfig.getExpiryDate(currentDate);

        session = await SessionService.create({
          user_id: user.id,
          expired_at: expiryDate,
          session_start: currentDate,
          hashed_session_id: hashedSessionId,
        });
      }

      // deactivate all email verification tokens for this user
      await UserTokenService.updateManyWhere(
        { user_id: user.id },
        { active: false }
      );

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
