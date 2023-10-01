const data = require("../../src/assets/data.json");
const suggestions = require("../../src/assets/suggestions.json");

const suggestionTitles = suggestions.map((str) => ({
  original: str,
  normalized: str.split("/")[0].trim().toLowerCase(),
}));

let counter = 0;
let hasErrors = false;

for (const { answer, days } of data) {
  counter++;
  if (!suggestions.includes(answer)) {
    console.log(
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
      console.log(`Suggestion: "${search.original}"`);
    }
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`✅ everything looks good! ${counter} checked`);
