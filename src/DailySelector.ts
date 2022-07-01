import metadatas from "./assets/metadata.json";

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

export const getDayNumberAndAnswer = (): {
  dayNumber: number;
  answer: string;
} => {
  const dayNumber = getDayOfYear() - DDAY;
  if (dayNumber in metadatas) {
    console.log(`Day ${dayNumber}`);
    return {
      dayNumber,
      answer: (metadatas as any)[dayNumber].name,
    };
  }
  console.log(`Day ${dayNumber} not found`);
  return {
    dayNumber: 1,
    answer: metadatas[1].name,
  };
};
