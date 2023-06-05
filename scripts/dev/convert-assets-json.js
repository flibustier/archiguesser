const { writeFileSync } = require("fs");

const answers = require("../../src/assets/answers.json");
const years = require("../../src/assets/years.json");
const copyrights = require("../../src/assets/copyrights.json");
const monuments = require("../../src/assets/monuments.json");
const links = require("../../src/assets/links.json");
const suggestions = require("../../src/assets/suggestions.json");

const data = [];

const isSameObject = (a, b) => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    if (!(key in b) || a[key] !== b[key]) {
      return false;
    }
  }

  return true;
};

for (const day in answers) {
  const answer = answers[day];
  const dayNumber = parseInt(day);

  if (!suggestions.includes(answer)) {
    throw `${answer} not found in src/assets/suggestions.json !`;
  }

  const existingDay = data.find((d) => d.answer === answer);

  if (existingDay) {
    existingDay.days.push(dayNumber);
    if (links[day]) {
      existingDay.links.push(links[day]);
    }
    if (years[day]) {
      existingDay.years = years[day];
    }
    if (
      copyrights[day] &&
      !isSameObject(existingDay.copyrights[0], copyrights[day])
    ) {
      existingDay.copyrights.push(copyrights[day]);
    }
    continue;
  }

  data.push({
    answer,
    days: [dayNumber],
    copyrights: [copyrights[day]],
    years: years[day],
    links: links[day] ? [links[day]] : [],
    categories: monuments.includes(dayNumber) ? ["monument"] : [],
  });
}

const fileContent = JSON.stringify(data, null, 2);

console.log(fileContent);

writeFileSync("src/assets/days.json", fileContent);
