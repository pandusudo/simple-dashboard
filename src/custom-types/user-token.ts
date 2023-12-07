import { UserToken as PrismaUserToken, User } from '@prisma/client';

export type UserToken = PrismaUserToken & {
  user?: User;
};
