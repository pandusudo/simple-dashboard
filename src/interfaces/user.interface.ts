import { users } from '@prisma/client';

export interface UserInterface extends Omit<users, 'password'> {}
