import answers from "./assets/answers.json";
import monuments from "./assets/monuments.json";

const DDAY = 182;

// 1 to 365/366
const getDayOfYear = (date = new Date()): number => {
  const timestamp1 = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const timestamp2 = Date.UTC(date.getFullYear(), 0, 0);
  const differenceInMilliseconds = timestamp1 - timestamp2;
  const differenceInDays = differenceInMilliseconds / 1000 / 60 / 60 / 24;

  return differenceInDays;
};

// fixme: 2024 is a leap year, 2024-12-31 will collide with 2025-01-01
export const getRealDayNumber = (): number =>
  (getDayOfYear() + 365 - DDAY) % 365;

export const getDayInformation = (
  day?: string | null
): {
  dayNumber: number;
  answer: string;
  isMonument: boolean;
} => {
  let dayNumber = getRealDayNumber();

  if (day && day in answers) {
    dayNumber = parseInt(day);
  }

  if (dayNumber in answers) {
    const answer = answers[dayNumber as unknown as keyof typeof answers];

    return {
      dayNumber,
      answer,
      isMonument: isMonument(dayNumber),
    };
  }
  console.log(`Day ${dayNumber} not found`);
  return {
    dayNumber: 1,
    answer: answers[1],
    isMonument: false,
  };
};

export const isMonument = (dayNumber: number): boolean =>
  monuments.includes(dayNumber);
