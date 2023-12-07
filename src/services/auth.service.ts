import { SignupDTO } from '../dtos/auth/signup.dto';
import { UserService } from '../services/user.service';
import { EmailService } from '../services/mail.service';
import { User } from '../custom-types/user';
import { generateRandomString } from '../helpers/string';
import { UserTokenService } from '../services/user-token.service';
import {
  hashWithBcrypt,
  hashWithCrypto,
  validateBcryptHash,
} from '../helpers/hash';
import { encryptWithCipher } from '../helpers/encrypt';
import { SigninDTO } from '../dtos/auth/signin.dto';
import { UnauthorizedError } from '../helpers/errors/UnauthorizedError';
import { SessionService } from './sessions.service';
import { sessionConfig, userTokenConfig } from '../configs/common';
import { throwError } from '../helpers/error-thrower';
import { SigninGoogleDTO } from '../dtos/auth/signin-google.dto';

export class AuthService {
  private static serviceName: string = 'Auth';
  static async signup(payload: SignupDTO): Promise<Partial<User>> {
    try {
      const currentDate = new Date();

      const user = await UserService.create({
        email: payload.email,
        password: hashWithBcrypt(payload.password),
        name: payload.name,
        signed_up_at: currentDate,
        is_logged_in: false,
        signed_in_at: null,
      });

      const token = generateRandomString();
      const encryptedToken = encryptWithCipher(token);

      EmailService.sendVerificationEmail(
        payload.email,
        payload.name,
        encryptedToken
      );

      const expiryDate = userTokenConfig.getExpiryDate(currentDate);

      await UserTokenService.create({
        user_id: user.id,
        token,
        expired_at: expiryDate,
        type: 'email-verification',
        active: true,
      });

      return user;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  static async signin(payload: SigninDTO): Promise<{
    id: number;
    verified_at: Date;
    expiryDate: Date;
    hashedSessionId: string;
  }> {
    try {
      const includePassword = true;
      const user = await UserService.findOneWhere(
        {
          email: payload.email,
        },
        includePassword
      );

      if (!user) throw new UnauthorizedError('Invalid email or password!');

      const isCorrectPassword = validateBcryptHash(
        payload.password,
        user.password
      );

      if (!isCorrectPassword)
        throw new UnauthorizedError('Invalid email or password!');

      const hashedSessionId = hashWithCrypto(JSON.stringify({ id: user.id }));
      const currentDate = new Date();
      const expiryDate = sessionConfig.getExpiryDate(currentDate);

      await SessionService.create({
        user_id: user.id,
        expired_at: expiryDate,
        session_start: currentDate,
        hashed_session_id: hashedSessionId,
      });

      await UserService.updateWhere(
        { id: user.id },
        {
          login_counter: user.login_counter + 1,
          last_session: currentDate,
          signed_in_at: currentDate,
          is_logged_in: true,
        }
      );

      return {
        id: user.id,
        verified_at: user.verified_at,
        expiryDate,
        hashedSessionId,
      };
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  static async signinGoogle(payload: SigninGoogleDTO): Promise<{
    id: number;
    verified_at: Date;
    expiryDate: Date;
    hashedSessionId: string;
  }> {
    try {
      let userId = null;
      let verifiedAt = null;
      const currentDate = new Date();
      const expiryDate = sessionConfig.getExpiryDate(currentDate);

      const user = await UserService.findOneWhere({
        email: payload.email,
      });

      if (!user) {
        const newUser = await UserService.create({
          email: payload.email,
          password: null,
          name: payload.name,
          signed_up_at: currentDate,
          login_counter: 1,
          signed_in_at: currentDate,
          verified_at: currentDate,
          is_logged_in: true,
          last_session: currentDate,
        });
        userId = newUser.id;
        verifiedAt = newUser.verified_at;
      } else {
        const updatedUser = await UserService.updateWhere(
          { id: user.id },
          {
            login_counter: user.login_counter + 1,
            last_session: currentDate,
            signed_in_at: currentDate,
            is_logged_in: true,
          }
        );
        userId = updatedUser.id;
        verifiedAt = updatedUser.verified_at;
      }
      const hashedSessionId = hashWithCrypto(JSON.stringify({ id: userId }));

      await SessionService.create({
        user_id: userId,
        expired_at: expiryDate,
        session_start: currentDate,
        hashed_session_id: hashedSessionId,
      });

      return {
        id: userId,
        verified_at: verifiedAt,
        expiryDate,
        hashedSessionId,
      };
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  static async logout(userId: number): Promise<void> {
    try {
      await UserService.updateWhere(
        { id: userId },
        { is_logged_in: false, signed_in_at: null }
      );
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }
}
