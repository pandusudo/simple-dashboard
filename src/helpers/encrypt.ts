import crypto from 'crypto';
import { BadRequestError } from './errors/BadRequestError';

const algorithm = 'aes-256-ctr';
const secretKey = process.env.HASH_SECRET;
const salt = process.env.SALT;
const derivedKey = crypto.scryptSync(secretKey, salt, 32);

export function encryptWithCipher(str: string): string {
  try {
    const iv = crypto.randomBytes(16); // Generate a random IV
    const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);

    let encrypted = cipher.update(str, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + encrypted;
  } catch (error) {
    throw new Error('Token encryption error!');
  }
}

export function decryptWithCipher(encryptedString: string): string {
  try {
    const iv = Buffer.from(encryptedString.slice(0, 32), 'hex');
    const encryptedText = encryptedString.slice(32);

    const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new BadRequestError('Your token is invalid!');
  }
}
