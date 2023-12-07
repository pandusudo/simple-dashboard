import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

export function hashWithBcrypt(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function validateBcryptHash(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashWithCrypto(sessionId: string): string {
  const hash = createHash('sha256');
  hash.update(sessionId);
  const hashedSessionId = hash.digest('hex');

  return hashedSessionId;
}
