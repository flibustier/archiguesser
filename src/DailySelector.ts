import data from "./assets/data.json";

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

const getDayNumber = (dayNumber: number) =>
  data.find(({ days }) => days.includes(dayNumber));

export const lastDay = () => Math.max(...data.flatMap(({ days }) => days));

export const isMonument = (dayNumber: number): boolean => {
  const { categories = [] } = getDayNumber(dayNumber) || {};

  return categories.includes("monument");
};

export const getDayInformation = (
  day?: string | null
): {
  dayNumber: number;
  answer: string;
  isMonument: boolean;
  constructionYears?: string;
  copyrights?: any;
  links?: string[];
} => {
  let dayNumber = day ? parseInt(day) : getRealDayNumber();

  if (!data.some(({ days }) => days.includes(dayNumber))) {
    // fallback on last day when the day is not available yet
    dayNumber = lastDay();
  }

  const dayInformation = getDayNumber(dayNumber);

  if (dayInformation) {
    // default copyrights is the first entry [{…}]
    let copyrights = dayInformation.copyrights[0] || {};
    // multiple copyrights exists when there is multiple days for this entry (ex. days: [1, 100])
    if (dayInformation.copyrights.length > 1) {
      // search for the dayNumber index on the list of days (ex. 100 is index 1 in days: [1, 100])
      const copyrightIndex = dayInformation.days.indexOf(dayNumber);
      // copyrights are at the same index (ex. copyrights: [{this are copyrights for day 1}, {this are copyrights for day 100 }])
      copyrights = dayInformation.copyrights[copyrightIndex] || {};
    }

    return {
      dayNumber,
      answer: dayInformation.answer,
      isMonument: (dayInformation.categories as string[]).includes("monument"),
      constructionYears: dayInformation.years,
      copyrights,
      links: dayInformation.links,
    };
  }

  // shouldn’t be possible
  console.log(`Day ${dayNumber} not found`);
  return {
    dayNumber: 1,
    answer: data[1].answer,
    isMonument: false,
  };
};
