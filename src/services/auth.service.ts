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
import { verifyGoogleToken } from '../helpers/google';

export class AuthService {
  // Descriptive name for the service
  private static serviceName: string = 'Auth';

  /**
   * The `signup` function creates a new user, generates a verification token, sets an expiry date for
   * the token, creates a user token for email verification, and sends a verification email to the
   * user.
   * @param {SignupDTO} payload - The `payload` parameter is an object that contains the following
   * properties:
   * @returns a `Promise` that resolves to a Partial `User` object.
   */
  static async signup(payload: SignupDTO): Promise<Partial<User>> {
    try {
      const currentDate = new Date();

      // Create a new user
      const user = await UserService.create({
        email: payload.email,
        password: hashWithBcrypt(payload.password),
        name: payload.name,
        signed_up_at: currentDate,
        is_logged_in: false,
        signed_in_at: null,
        register_type: 'credential',
      });

      // Generate a random token for email verification
      const token = generateRandomString();
      const encryptedToken = encryptWithCipher(token);

      // Set the expiry date for the verification token
      const expiryDate = userTokenConfig.getExpiryDate(currentDate);

      // Create a new user token for email verification
      await UserTokenService.create({
        user_id: user.id,
        token,
        expired_at: expiryDate,
        type: 'email-verification',
        active: true,
      });

      // Send a verification email to the user
      EmailService.sendVerificationEmail(
        payload.email,
        payload.name,
        encryptedToken
      );

      return user;
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }

  /**
   * The `signin` function is used to authenticate a user by checking their email and password,
   * generating a session ID, and creating a new session for the user.
   * @param {SigninDTO} payload - The `payload` parameter is an object of type `SigninDTO`
   * @returns an object with the following properties:
   */
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

      // Check if the user or password is invalid
      if (!user || !user.password)
        throw new UnauthorizedError('Invalid email or password!');

      // Validate the provided password
      const isCorrectPassword = await validateBcryptHash(
        payload.password,
        user.password
      );

      // Throw an error if the password is invalid
      if (!isCorrectPassword)
        throw new UnauthorizedError('Invalid email or password!');

      // Generate a hashed session ID for the user
      const hashedSessionId = hashWithCrypto(JSON.stringify({ id: user.id }));
      const currentDate = new Date();
      const expiryDate = sessionConfig.getExpiryDate(currentDate);

      // Create a new session for the user
      await SessionService.create({
        user_id: user.id,
        expired_at: expiryDate,
        session_start: currentDate,
        hashed_session_id: hashedSessionId,
      });

      // Update user information after successful signin
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

  /**
   * The `signinGoogle` function handles the sign-in process using Google OAuth, verifying the token,
   * creating or updating the user information, generating a hashed session ID, and creating a new
   * session for the user.
   * @param {SigninGoogleDTO} payload - The `payload` parameter is an object of type `SigninGoogleDTO`
   * @returns an object with the following properties:
   */
  static async signinGoogle(payload: SigninGoogleDTO): Promise<{
    id: number;
    verified_at: Date;
    expiryDate: Date;
    hashedSessionId: string;
  }> {
    try {
      // Verify the Google OAuth token
      const { email, name } = await verifyGoogleToken(payload.token);

      let userId = null;
      let verifiedAt = null;
      const currentDate = new Date();
      const expiryDate = sessionConfig.getExpiryDate(currentDate);

      // Check if the user already exists
      const user = await UserService.findOneWhere({
        email,
      });

      if (!user) {
        // Create a new user if not found
        const newUser = await UserService.create({
          email,
          password: null,
          name,
          signed_up_at: currentDate,
          login_counter: 1,
          signed_in_at: currentDate,
          verified_at: currentDate,
          is_logged_in: true,
          last_session: currentDate,
          register_type: 'google',
        });
        userId = newUser.id;
        verifiedAt = newUser.verified_at;
      } else {
        // Update user information if the user already exists
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
      // Generate a hashed session ID for the user
      const hashedSessionId = hashWithCrypto(JSON.stringify({ id: userId }));

      // Create a new session for the user
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

  /**
   * The `logout` function updates the user information to mark them as logged out.
   * @param {number} userId - The userId parameter is the unique identifier of the user who wants to
   * log out.
   */
  static async logout(userId: number): Promise<void> {
    try {
      // Update user information to mark as logged out
      await UserService.updateWhere(
        { id: userId },
        { is_logged_in: false, signed_in_at: null }
      );
    } catch (error) {
      throwError(error, this.serviceName);
    }
  }
}
