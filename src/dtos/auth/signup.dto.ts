import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { IsUnique } from '../../decorators/is-unique';
import { UserService } from '../../services/user.service';
import { IsSameAs } from '../../decorators/is-same-as';

export class SignupDTO {
  @IsEmail()
  @IsDefined()
  @IsNotEmpty()
  @IsUnique({ getService: () => UserService })
  email: string;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  name: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'password must contain at least one lowercase, one uppercase, one digit, and one special character',
    }
  )
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'reconfirm password must contain at least one lowercase, one uppercase, one digit, and one special character',
    }
  )
  @IsSameAs('password')
  reconfirm_password: string;
}
