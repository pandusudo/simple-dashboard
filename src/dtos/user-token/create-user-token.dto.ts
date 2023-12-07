export class CreateUserTokenDTO {
  user_id: number;
  token: string;
  type: string;
  expired_at: Date;
  active: boolean;
}
