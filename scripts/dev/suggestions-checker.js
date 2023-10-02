const data = require("../../src/assets/data.json");
const suggestions = require("../../src/assets/suggestions.json");

const suggestionTitles = suggestions.map((str) => ({
  original: str,
  normalized: str.split("/")[0].trim().toLowerCase(),
}));

let counter = 0;
let missingYears = 0;
let missingLinks = 0;
let hasErrors = false;

for (const { answer, days, years, links } of data) {
  counter++;
  if (!suggestions.includes(answer)) {
    console.error(
      `"${answer}" (day ${days[0]}) is missing from suggestions.json!`,
    );
    hasErrors = true;

    const normalizedToFind = answer.split("/")[0].trim().toLowerCase();
    const search = suggestionTitles.find(
      ({ normalized }) =>
        normalized.includes(normalizedToFind) ||
        normalizedToFind.includes(normalized),
    );
    if (search) {
      console.info(`Suggestion: "${search.original}"`);
    }
  }

  if (!years || links.length === 0) {
    const missing = [];
    if (!years) {
      missing.push("building years");
      missingYears++;
    }
    if (links.length === 0) {
      missing.push("links");
      missingLinks++;
    }
    console.warn(
      `[${missing.length}] ${answer} is missing ${missing.join(" and ")}`,
    );
  }
}

if (hasErrors) {
  process.exit(1);
}

console.info(
  `✅ no error found! ${counter} checked: ${missingYears} building years missing, ${missingLinks} missing links`,
);
