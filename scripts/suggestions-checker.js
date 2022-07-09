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
const newSuggestions = suggestions;
let i = 0;

const suggestionsArray = suggestions
  .map((str) => str.split("/"))
  .filter((x) => x.length > 2);
data
  .map((str) => str.split("/"))
  .filter((x) => x.length > 2)
  .forEach(([rawTitle, rawArchitects]) => {
    const title = rawTitle.replaceAll("&amp;", "&");
    const architects = rawArchitects.replaceAll("&amp;", "&");

    const search = suggestionsArray.find(
      ([suggestionTitle]) => suggestionTitle === title
    );

    if (!search) {
      //console.log(`${title} is missing from suggestions!`);
      return;
    }

    if (search[1] !== architects) {
      const index = newSuggestions.findIndex((str) => str.includes(title));

      if (index === -1) {
        console.log(`index not found: ${title}`);
      }

      console.log(newSuggestions[index]);
      newSuggestions[index] = newSuggestions[index].replace(
        search[1],
        architects
      );
      console.log(newSuggestions[index]);
      i++;
    }
  });

console.log(i);
*/
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
