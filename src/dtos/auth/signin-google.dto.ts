import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class SigninGoogleDTO {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  token: string;
}
