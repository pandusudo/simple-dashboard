import {
  IsDate,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDTO {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain at least one lowercase, one uppercase, one digit, and one special character.',
    }
  )
  password?: string;

  @IsOptional()
  @IsNumber()
  login_counter?: number;

  @IsOptional()
  @IsDate()
  last_session?: Date;

  @IsOptional()
  @IsDate()
  verification_sent_at?: Date;

  @IsOptional()
  @IsDate()
  verified_at?: Date;

  @IsOptional()
  @IsDate()
  signed_up_at?: Date;
}
