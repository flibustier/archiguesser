import data from "../../src/assets/data.json" with { type: "json" };

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
    .filter(([, count]) => count > 4),
);
