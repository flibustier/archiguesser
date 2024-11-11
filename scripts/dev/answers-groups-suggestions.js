import data from "../../src/assets/data.json" with { type: "json" };
import config from "../../src/config.json" with { type: "json" };

const already_listed_categories = [
  ...config.LISTED_CATEGORIES,
  ...config.LOCKED_CATEGORIES_LOGGED,
];

const stats = {};

for (const day of data) {
  const answer = day.answer;
  answer
    .split(" / ")
    .slice(1)
    .flatMap((s) => s.split(", "))
    .map((s) => s.trim())
    .concat(day.categories)
    .forEach((s) => (stats[s] = (stats[s] || 0) + 1));
}

console.log(
  Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count > 4)
    .filter(([category]) => !already_listed_categories.includes(category)),
);
