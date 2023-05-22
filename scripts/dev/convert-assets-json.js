const { writeFileSync } = require("fs");

const answers = require("../../src/assets/answers.json");
const years = require("../../src/assets/years.json");
const copyrights = require("../../src/assets/copyrights.json");
const monuments = require("../../src/assets/monuments.json");
const links = require("../../src/assets/links.json");
const suggestions = require("../../src/assets/suggestions.json");

const data = [];

for (const day in answers) {
  const answer = answers[day];
  const dayNumber = parseInt(day);

  if (!suggestions.includes(answer)) {
    throw `${answer} not found in src/assets/suggestions.json !`;
  }

  const existingDayIndex = data.findIndex((d) => d.answer === answer);

  if (existingDayIndex != -1) {
    data[existingDayIndex].days.push(dayNumber);
    data[existingDayIndex].copyrights.push(copyrights[day]);
    continue;
  }

  data.push({
    answer,
    days: [dayNumber],
    copyrights: [copyrights[day]],
    years: years[day],
    link: links[day],
    categories: monuments.includes(dayNumber) ? ["monument"] : [],
  });
}

const fileContent = JSON.stringify(data, null, 2);

console.log(fileContent);

writeFileSync("src/assets/days.json", fileContent);
