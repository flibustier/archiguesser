import type { GameIndex } from "./types.ts";

export const dayExists = (day: number, index: GameIndex): boolean =>
  Number.isInteger(day) &&
  day >= 0 &&
  day <= index.lastDay &&
  !index.missingDays.includes(day);

// The day to play for a requested day: itself when it exists, otherwise the
// most recent day already published (today's project may not be online yet).
export const resolveDay = (
  requested: number,
  today: number,
  index: GameIndex,
): number => {
  if (dayExists(requested, index)) {
    return requested;
  }
  for (let day = Math.min(today, index.lastDay); day >= 0; day--) {
    if (dayExists(day, index)) {
      return day;
    }
  }

  return 0;
};

// The days offered for replay, most recent first
export const replayableDays = (
  today: number,
  skippedDays: number[],
  limit: number,
): number[] =>
  [...Array(Math.max(today, 0)).keys()]
    .filter((day) => !skippedDays.includes(day))
    .slice(-limit)
    .reverse();
