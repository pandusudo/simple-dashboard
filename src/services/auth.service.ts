import { SignupDTO } from '../dtos/auth/signup.dto';
import { CreateUserDTO } from '../dtos/user/create-user.dto';
import { UserService } from './user.service';
import { EmailService } from './mail.service';
import { users } from '@prisma/client';
import { generateRandomString } from '../helpers/string';
import { UserTokenService } from './user-token.service';
import { encryptToken } from '../helpers/hash';

export class AuthService {
  static async signup(payload: SignupDTO): Promise<Omit<users, 'password'>> {
    try {
      const data: CreateUserDTO = {
        email: payload.email,
        password: payload.password,
        name: payload.name,
      };
      const user = await UserService.createUser(data);

      const token = generateRandomString();
      const encryptedToken = encryptToken(token);

      EmailService.sendEmail(
        payload.email,
        'Email Verification',
        encryptedToken
      );

      await UserTokenService.createUserToken({
        user_id: user.id,
        token,
        expiredAt: new Date(),
        type: 'email-verification',
      });

      return user;
    } catch (error) {
      throw new Error(error);
    }
  }
}
