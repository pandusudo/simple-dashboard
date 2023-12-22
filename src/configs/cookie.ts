import { CookieOptions } from 'express';

export const cookieSettings: CookieOptions = {
  httpOnly: true,
  secure: process.env.ENVIRONMENT !== 'development',
  sameSite: 'lax',
  domain: process.env.FE_DOMAIN,
};
