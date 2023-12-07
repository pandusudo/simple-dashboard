import { User as PrismaUser, Session } from '@prisma/client';

export type User = PrismaUser & {
  sessions?: Partial<Session>[];
};
