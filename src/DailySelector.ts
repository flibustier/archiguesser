import metadata from "./assets/metadata.json";

const DDAY = 182;

const getDayOfYear = (date = new Date()) => {
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

export const getRealDayNumber = () => getDayOfYear() - DDAY;

export const getDayInformation = (
  day?: string | null
): {
  dayNumber: number;
  answer: string;
  isMonument: boolean;
} => {
  let dayNumber = getRealDayNumber();

  if (day && day in metadata) {
    dayNumber = parseInt(day);
  }

  if (dayNumber in metadata) {
    const { name: answer, isMonument = false } = (metadata as any)[dayNumber];

    return {
      dayNumber,
      answer,
      isMonument,
    };
  }
  console.log(`Day ${dayNumber} not found`);
  return {
    dayNumber: 1,
    answer: metadata[1].name,
    isMonument: false,
  };
};
