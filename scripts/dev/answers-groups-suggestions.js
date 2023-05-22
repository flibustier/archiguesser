const answers = require("../../src/assets/answers.json");

const stats = {};

for (const day in answers) {
  const answer = answers[day];
  answer
    .split(" / ")
    .slice(1)
    .flatMap((s) => s.split(", "))
    .map((s) => s.trim())
    .forEach((s) => (stats[s] = (stats[s] || 0) + 1));
}

console.log(Object.entries(stats).sort((a, b) => b[1] - a[1]));
