import { STARTING_DATE } from "../config.json";

const StartDate = Date.UTC(
  STARTING_DATE[0],
  STARTING_DATE[1],
  STARTING_DATE[2],
);

const getNumberOfDaysDifferenceWithStartingDate = (date: Date): number => {
  const timestamp1 = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const differenceInMilliseconds = timestamp1 - StartDate;
  const differenceInDays = differenceInMilliseconds / 1000 / 60 / 60 / 24;

  return differenceInDays;
};

export const getRealDayNumber = (): number => {
  const now = new Date();

  return getNumberOfDaysDifferenceWithStartingDate(now);
};
