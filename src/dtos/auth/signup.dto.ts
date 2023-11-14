import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { IsUnique } from '../../decorators/is-unique';
import { UserService } from '../../services/user.service';

export class SignupDTO {
  @IsEmail()
  @IsUnique({ getService: () => UserService })
  email: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain at least one lowercase, one uppercase, one digit, and one special character.',
    }
  )
  password: string;
}
