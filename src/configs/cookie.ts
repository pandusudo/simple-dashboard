import { CookieOptions } from 'express';

export const cookieSettings: CookieOptions = {
  httpOnly: true,
  secure: process.env.ENVIRONMENT !== 'development',
  sameSite: 'strict',
  domain:
    process.env.ENVIRONMENT !== 'development'
      ? process.env.FE_DOMAIN
      : '.localhost',
};
