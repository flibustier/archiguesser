/* eslint-disable no-undef */
const metadata = require("../src/assets/metadata.json");
const suggestions = require("../src/assets/suggestions.json");

const suggestionTitles = suggestions.map((str) => ({
  original: str,
  normalized: str.split("/")[0].trim().toLowerCase(),
}));

for (const key in metadata) {
  if (!suggestions.includes(metadata[key].name)) {
    console.log(
      `${key} : "${metadata[key].name}" is missing from suggestions.json!`
    );

    const normalizedToFind = metadata[key].name
      .split("/")[0]
      .trim()
      .toLowerCase();
    const search = suggestionTitles.find(
      ({ normalized }) =>
        normalized.includes(normalizedToFind) ||
        normalizedToFind.includes(normalized)
    );
    if (search) {
      console.log(`Suggestion: "${search.original}"`);
    }
  }
}

/*
const toMerge = data.map((str) => str.split("/")[0].trim().toLowerCase());
const suggestionsToMerge = 
for (const suggestion of suggestionsToMerge) {
  if (toMerge.includes(suggestion)) {
    console.log(`${suggestion} ✅`);
  } else {
    console.log(`${suggestion} ❌`);
  }
}
*/

console.log("✅ everything looks good!");
