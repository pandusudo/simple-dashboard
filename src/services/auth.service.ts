import { UserInterface } from '../interfaces/user.interface';
import { SignupDTO } from '../dtos/auth/signup.dto';
import { CreateUserDTO } from '../dtos/user/create-user.dto';
import { UserService } from './user.service';

export class AuthService {
  static async signup(payload: SignupDTO): Promise<UserInterface> {
    try {
      const data: CreateUserDTO = {
        email: payload.email,
        password: payload.password,
        name: payload.name,
      };
      return await UserService.createUser(data);
    } catch (error) {
      console.error(error);
    }
  }
}
