import { Session as PrismaSession, User } from '@prisma/client';

export type Session = PrismaSession & {
  user?: User;
};
