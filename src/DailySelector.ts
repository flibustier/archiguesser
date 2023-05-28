import answers from "./assets/answers.json";
import monuments from "./assets/monuments.json";
import years from "./assets/years.json";

// Here the first day was July the 2nd of 2022
const STARTING_DATE = Date.UTC(2022, 6, 1);

const getNumberOfDaysDifferenceWithStartingDate = (date: Date): number => {
  const timestamp1 = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const differenceInMilliseconds = timestamp1 - STARTING_DATE;
  const differenceInDays = differenceInMilliseconds / 1000 / 60 / 60 / 24;

  return differenceInDays;
};

export const getRealDayNumber = (): number => {
  const now = new Date();

  return getNumberOfDaysDifferenceWithStartingDate(now);
};

export const lastDay = () => parseInt(Object.keys(answers).pop() || "1");

const get = (json: any, dayNumber: number) =>
  json[dayNumber as unknown as keyof typeof json];

export const getDayInformation = (
  day?: string | null
): {
  dayNumber: number;
  answer: string;
  isMonument: boolean;
  constructionYears?: string;
} => {
  let dayNumber = getRealDayNumber();

  if (day && day in answers) {
    dayNumber = parseInt(day);
  }

  if (!(dayNumber in answers)) {
    // fallback on last day when the day is not available yet
    dayNumber = lastDay();
  }

  if (dayNumber in answers) {
    const answer = get(answers, dayNumber);

    return {
      dayNumber,
      answer,
      isMonument: isMonument(dayNumber),
      constructionYears: get(years, dayNumber),
    };
  }
  // shouldn’t be possible
  console.log(`Day ${dayNumber} not found`);
  return {
    dayNumber: 1,
    answer: answers[1],
    isMonument: false,
  };
};

export const isMonument = (dayNumber: number): boolean =>
  monuments.includes(dayNumber);
