export class CreateSessionDto {
  session_start: Date;
  expired_at: Date;
  hashed_session_id: string;
  user_id: number;
}
