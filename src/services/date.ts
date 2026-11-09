import config from "../config.json" with { type: "json" };

const { STARTING_DATE } = config;

const StartDate = Date.UTC(
  STARTING_DATE[0],
  STARTING_DATE[1],
  STARTING_DATE[2],
);

// Number of days between the first ArchiGuesser day and the given date, in the
// player's own time zone: the day changes at their local midnight.
export const getDayNumber = (date: Date): number => {
  const timestamp = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  return (timestamp - StartDate) / 1000 / 60 / 60 / 24;
};

export const getRealDayNumber = (): number => getDayNumber(new Date());
