import { prisma, Prisma } from '../configs/prisma';
import { CreateSessionDto } from '../dtos/sessions/create-session.dto';
import { Session } from '../custom-types/session';
import { UnauthorizedError } from '../helpers/errors/UnauthorizedError';
import { UserService } from './user.service';
import { hashWithCrypto } from '../helpers/hash';
import { authConfig, sessionConfig } from '../configs/common';
import { throwError } from '../helpers/error-thrower';

export class SessionService {
  private static serviceName: string = 'Sessions';

  static async create(payload: CreateSessionDto): Promise<Session> {
    try {
      const session = await prisma.session.create({ data: payload });

      return session;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  static async findOneWhere(
    payload: Prisma.SessionWhereInput,
    orderBy: Prisma.SessionOrderByWithAggregationInput,
    includeUser: boolean = false
  ): Promise<Session> {
    try {
      const session = await prisma.session.findFirst({
        where: payload,
        orderBy,
        include: { user: includeUser },
      });

      return session;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  static async updateWhere(
    payload: Prisma.SessionWhereUniqueInput,
    data: Prisma.SessionUpdateInput
  ): Promise<Session> {
    try {
      const session = await prisma.session.update({
        where: payload,
        data,
      });

      return session;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  static async checkAuthSession(hashedSessionId: string): Promise<Session> {
    try {
      const currentDate = new Date();
      if (!hashedSessionId)
        throw new UnauthorizedError("You're not allowed to access this API");

      const includeUser = true;
      const session = await this.findOneWhere(
        {
          hashed_session_id: hashedSessionId,
        },
        { created_at: 'desc' },
        includeUser
      );

      if (!session)
        throw new UnauthorizedError("You're not allowed to access this API");

      // auth is inactive if the user.signed_in_at is null or the user user.is_logged_in is false
      const isInactiveAuth =
        !session.user.signed_in_at || !session.user.is_logged_in;

      console.log(isInactiveAuth);

      let isExpiredAuth = true;
      if (session.user.signed_in_at) {
        const expiryDate = authConfig.getExpiryDate(session.user.signed_in_at);
        isExpiredAuth = expiryDate < currentDate;
      }

      if (isInactiveAuth || isExpiredAuth) {
        await UserService.updateWhere(
          { id: session.user_id },
          { is_logged_in: false, signed_in_at: null }
        );
        throw new UnauthorizedError("You're not allowed to access this API");
      }

      // check if the session is expired or not
      if (session.expired_at < currentDate) {
        const user = await UserService.updateWhere(
          { id: session.user_id },
          { last_session: currentDate }
        );

        const expiryDate = sessionConfig.getExpiryDate(currentDate);

        // return and create new session if the old session is expired
        const newSession = await this.create({
          user_id: session.user_id,
          expired_at: expiryDate,
          session_start: currentDate,
          hashed_session_id: hashWithCrypto(
            JSON.stringify({ id: session.user_id })
          ),
        });

        newSession.user = user;

        return newSession;
      } else {
        // return old session if it's still active
        return session;
      }
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }
}
