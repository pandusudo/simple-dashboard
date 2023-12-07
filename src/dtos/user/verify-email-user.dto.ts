import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailUserDTO {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  token: string;
}
