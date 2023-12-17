import {
  IsDefined,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { IsSameAs } from '../../decorators/is-same-as';

export class ResetPasswordUserDTO {
  @IsString()
  @IsDefined()
  old_password: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
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
        'peconfirm password must contain at least one lowercase, one uppercase, one digit, and one special character',
    }
  )
  @IsSameAs('password')
  reconfirm_password: string;
}
