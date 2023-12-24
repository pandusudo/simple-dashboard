import { CookieOptions } from 'express';

export const cookieSettings: CookieOptions = {
  httpOnly: true,
  secure: process.env.ENVIRONMENT !== 'development',
  sameSite: 'strict',
  domain: process.env.FE_DOMAIN,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
