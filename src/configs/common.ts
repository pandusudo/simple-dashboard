import { generateExpiryDate } from '../helpers/date';

export enum UnitOfTime {
  Second = 'second',
  Minute = 'minute',
  Hour = 'hour',
  Day = 'day',
}

type SessionConfigType = {
  expiryDuration: number;
  unitOfTime: UnitOfTime;
  getExpiryDate: (baseDate: Date) => Date;
};

type AuthConfigType = {
  expiryDuration: number;
  unitOfTime: UnitOfTime;
  getExpiryDate: (baseDate: Date) => Date;
};

type UserTokenConfigType = {
  expiryDuration: number;
  unitOfTime: UnitOfTime;
  getExpiryDate: (baseDate: Date) => Date;
};

export const sessionConfig: SessionConfigType = {
  // adjust these values to change the default expiry date duration of session
  expiryDuration: 5,
  unitOfTime: UnitOfTime.Minute,

  // function to generate and get the default session expiry date based on the base date and the default duration
  getExpiryDate: (baseDate: Date): Date => {
    return generateExpiryDate(
      baseDate,
      sessionConfig.expiryDuration,
      sessionConfig.unitOfTime
    );
  },
};

export const userTokenConfig: UserTokenConfigType = {
  // adjust these values to change the default expiry date duration of user token
  expiryDuration: 30,
  unitOfTime: UnitOfTime.Minute,

  // function to generate and get the default user token expiry date based on the base date and the default duration
  getExpiryDate: (baseDate: Date): Date => {
    return generateExpiryDate(
      baseDate,
      userTokenConfig.expiryDuration,
      userTokenConfig.unitOfTime
    );
  },
};

export const authConfig: AuthConfigType = {
  // adjust these values to change the default expiry date duration of authentication
  expiryDuration: 30,
  unitOfTime: UnitOfTime.Day,

  // function to generate and get the default authentication expiry date based on the base date and the default duration
  getExpiryDate: (baseDate: Date): Date => {
    return generateExpiryDate(
      baseDate,
      authConfig.expiryDuration,
      authConfig.unitOfTime
    );
  },
};
