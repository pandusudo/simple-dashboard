import crypto from 'crypto';

const algorithm = 'aes-256-ctr';
const secretKey = process.env.HASH_SECRET;
const salt = process.env.SALT;

const derivedKey = crypto.scryptSync(secretKey, salt, 32);

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + encrypted;
}

export function decryptToken(encryptedToken: string): string {
  const iv = Buffer.from(encryptedToken.slice(0, 32), 'hex');
  const encryptedText = encryptedToken.slice(32);

  const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
