import { prisma, Prisma } from '../configs/prisma';
import { CreateSessionDto } from '../dtos/sessions/create-session.dto';
import { Session } from '../custom-types/session';
import { UnauthorizedError } from '../helpers/errors/UnauthorizedError';
import { UserService } from './user.service';
import { hashWithCrypto } from '../helpers/hash';
import { authConfig, sessionConfig } from '../configs/common';
import { throwError } from '../helpers/error-thrower';

export class SessionService {
  // Descriptive name for the service
  private static serviceName: string = 'Sessions';

  /**
   * The function creates a new session using the provided payload and returns the created session.
   * @param {CreateSessionDto} payload - The `payload` parameter is of type `CreateSessionDto`. It is
   * an object that contains the data needed to create a new session.
   * @returns The `create` method is returning a `Promise` that resolves to a `Session` object.
   */
  static async create(payload: CreateSessionDto): Promise<Session> {
    try {
      const session = await prisma.session.create({ data: payload });
      return session;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  /**
   * The function `findOneWhere` is a static async function that takes in a payload, orderBy, and
   * includeUser as parameters and returns a Promise that resolves to a Session object.
   * @param payload - The `payload` parameter is an object that specifies the conditions for finding a
   * session. It is of type `Prisma.SessionWhereInput`, which is a Prisma input type used for filtering
   * records based on various conditions.
   * @param orderBy - The `orderBy` parameter is used to specify the sorting order of the sessions
   * returned by the query. It is of type `Prisma.SessionOrderByWithAggregationInput`, which is an
   * input object type provided by Prisma. This type allows you to specify the fields to sort by and
   * the sorting order
   * @param {boolean} [includeUser=false] - The `includeUser` parameter is a boolean value that
   * determines whether or not to include the associated user object in the returned session object. If
   * `includeUser` is set to `true`, the user object will be included. If `includeUser` is set to
   * `false` (which is the
   * @returns a `Promise` that resolves to a `Session` object.
   */
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

  /**
   * The function `updateWhere` updates a session in the database based on a unique input and returns
   * the updated session.
   * @param payload - The `payload` parameter is of type `Prisma.SessionWhereUniqueInput` and
   * represents the unique identifier of the session you want to update. It is used to specify the
   * session you want to update in the database.
   * @param data - The `data` parameter is an object that contains the fields and values that you want
   * to update for the session. It should be of type `Prisma.SessionUpdateInput`.
   * @returns a `Promise` that resolves to a `Session` object.
   */
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

  /**
   * The function `checkAuthSession` checks the validity of a session based on a hashed session ID and
   * returns the session if it is still active, otherwise it throws an unauthorized error.
   * @param {string} hashedSessionId - The `hashedSessionId` parameter is a string that represents the
   * hashed session ID. It is used to identify a specific session in the authentication process.
   * @returns The function `checkAuthSession` returns a `Promise` that resolves to a `Session` object.
   */
  static async checkAuthSession(hashedSessionId: string): Promise<Session> {
    try {
      const currentDate = new Date();

      // Check if the hashed session ID is provided
      if (!hashedSessionId) {
        throw new UnauthorizedError('Your session has expired');
      }

      const includeUser = true;

      // Find the session based on the hashed session ID
      const session = await this.findOneWhere(
        { hashed_session_id: hashedSessionId },
        { created_at: 'desc' },
        includeUser
      );

      // If session is not found, throw an unauthorized error
      if (!session) {
        throw new UnauthorizedError('Your session has expired');
      }

      // Check if the authentication is inactive
      const isInactiveAuth =
        !session.user.signed_in_at || !session.user.is_logged_in;

      // Check if the authentication is expired
      let isExpiredAuth = true;
      if (session.user.signed_in_at) {
        const expiryDate = authConfig.getExpiryDate(session.user.signed_in_at);
        isExpiredAuth = expiryDate < currentDate;
      }

      // If authentication is inactive or expired, update user and throw an unauthorized error
      if (isInactiveAuth || isExpiredAuth) {
        await UserService.updateWhere(
          { id: session.user_id },
          { is_logged_in: false, signed_in_at: null }
        );
        throw new UnauthorizedError('Your session has expired');
      }

      // Check if the session itself is expired
      if (session.expired_at < currentDate) {
        // Update user's last session
        const user = await UserService.updateWhere(
          { id: session.user_id },
          { last_session: currentDate }
        );

        // Calculate the expiry date for the new session
        const expiryDate = sessionConfig.getExpiryDate(currentDate);

        // Create and return a new session
        const newSession = await this.create({
          user_id: session.user_id,
          expired_at: expiryDate,
          session_start: currentDate,
          hashed_session_id: hashWithCrypto(
            JSON.stringify({ id: session.user_id })
          ),
        });

        // Attach the updated user to the new session
        newSession.user = user;

        return newSession;
      } else {
        // If the old session is still active, return it
        return session;
      }
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }
}
