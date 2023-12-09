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
import { hashWithCrypto } from '../helpers/hash';
import { QueryDTO } from '../dtos/query.dto';
import { UpdateUserDTO } from '../dtos/user/edit-user.dto';
import { sessionConfig, userTokenConfig } from '../configs/common';
import { Session } from '../custom-types/session';
import { throwError } from '../helpers/error-thrower';

export class UserService {
  private static serviceName: string = 'User';

  static async getUserDashboard(): Promise<any> {
    const totalUsers = await prisma.user.count();

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const activeUsersToday = await prisma.session.findMany({
      where: {
        created_at: {
          gte: currentDate,
        },
      },
      distinct: ['user_id'],
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const averageActiveSessionUsers = await prisma.session.groupBy({
      by: ['user_id'],
      where: {
        session_start: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        user_id: true,
      },
    });

    const totalDays = averageActiveSessionUsers.length;
    const totalActiveUsers = averageActiveSessionUsers.reduce(
      (sum, entry) => sum + entry._count.user_id,
      0
    );
    const averageActiveSessionUsersLast7Days =
      totalDays > 0 ? totalActiveUsers / totalDays : 0;

    return {
      total_users: totalUsers,
      active_users_today: activeUsersToday.length,
      average_active_users_last_7_days: averageActiveSessionUsersLast7Days,
    };
  }

  static async getAll(payload: QueryDTO): Promise<Partial<User>[]> {
    let { page, limit } = payload;

    // check if the page or limit is less than 1. if true, change the page or limit to the default value.
    page = page >= 1 ? page : 1;
    limit = limit >= 1 ? limit : 25;

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
      return users;
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
