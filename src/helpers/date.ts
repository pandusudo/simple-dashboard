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
