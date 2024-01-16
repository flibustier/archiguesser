import data from "../assets/data.json";
import { getRealDayNumber } from "./date";

const getProjectByDayNumber = (dayNumber: number) =>
  data.find(({ days }) => days.includes(dayNumber));

export const lastDay = () => Math.max(...data.flatMap(({ days }) => days));

export const isMonument = (dayNumber: number): boolean => {
  const { categories = [] } = getProjectByDayNumber(dayNumber) || {};

  return categories.includes("monument");
};

export const getProjectsByCategory = (category: string) => {
  const filtered = data.filter(({ categories = [] }) =>
    categories.includes(category),
  );

  if (filtered.length > 0) {
    return filtered;
  }

  return data.filter(({ answer }) => answer.includes(category));
};

export const getProjectInformation = (
  day?: string | null,
): {
  dayNumber: number;
  answer: string;
  isMonument: boolean;
  constructionYears?: string;
  copyrights?: any;
  links?: string[];
  categories?: string[];
} => {
  let dayNumber = day ? parseInt(day) : getRealDayNumber();

  if (!data.some(({ days }) => days.includes(dayNumber))) {
    // fallback on last day when the day is not available yet
    dayNumber = lastDay();
  }

  const dayInformation = getProjectByDayNumber(dayNumber);

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
      categories: dayInformation.categories,
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
