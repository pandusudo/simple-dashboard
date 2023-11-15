export class CreateUserTokenDto {
  user_id: number;
  token: string;
  type: string;
  expiredAt: Date;
}
