import { UnitOfTime } from '../configs/common';

export function addSecondsToDate(baseDate: Date, secondsToAdd: number): Date {
  const resultDate = new Date(baseDate);
  resultDate.setMinutes(resultDate.getSeconds() + secondsToAdd);
  return resultDate;
}

export function addMinutesToDate(baseDate: Date, minutesToAdd: number): Date {
  const resultDate = new Date(baseDate);
  resultDate.setMinutes(resultDate.getMinutes() + minutesToAdd);
  return resultDate;
}

export function addHoursToDate(baseDate: Date, hoursToAdd: number): Date {
  const resultDate = new Date(baseDate);
  resultDate.setDate(baseDate.getHours() + hoursToAdd);
  return resultDate;
}

export function addDaysToDate(baseDate: Date, daysToAdd: number): Date {
  const resultDate = new Date(baseDate);
  resultDate.setDate(baseDate.getDate() + daysToAdd);
  return resultDate;
}

/**
 * The function `generateExpiryDate` takes a base date, a duration, and a unit of time, and returns an
 * expiry date by adding the specified duration to the base date.
 * @param {Date} baseDate - The baseDate parameter is the starting date from which the expiry date will
 * be calculated.
 * @param {number} duration - The duration parameter represents the amount of time to add to the
 * baseDate. It is a number that specifies the duration in the unit of time specified by the unitOfTime
 * parameter.
 * @param {UnitOfTime} unitOfTime - The `unitOfTime` parameter is an enum that represents the unit of
 * time for the duration. It can have the following values:
 * @returns the expiry date as a Date object.
 */
export function generateExpiryDate(
  baseDate: Date,
  duration: number,
  unitOfTime: UnitOfTime
): Date {
  let expiryDate: Date;

  switch (unitOfTime) {
    case UnitOfTime.Second:
      expiryDate = addSecondsToDate(baseDate, duration);
      break;
    case UnitOfTime.Minute:
      expiryDate = addMinutesToDate(baseDate, duration);
      break;
    case UnitOfTime.Hour:
      expiryDate = addHoursToDate(baseDate, duration);
      break;
    case UnitOfTime.Day:
      expiryDate = addDaysToDate(baseDate, duration);
      break;
    default:
      expiryDate = new Date();
      break;
  }

  return expiryDate;
}
