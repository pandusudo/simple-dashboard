import { CookieOptions } from 'express';

export const cookieSettings: CookieOptions = {
  httpOnly: true,
  secure: process.env.ENVIRONMENT !== 'development',
  sameSite: 'strict',
};
