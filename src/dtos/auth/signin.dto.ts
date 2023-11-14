import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class SigninDTO {
  @IsEmail()
  email: string;

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
