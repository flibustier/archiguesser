#!/usr/bin/node

const { writeFileSync } = require("fs");

const data = require("../../src/assets/data.json");
const suggestions = require("../../src/assets/suggestions.json");

const OUTPUT_FILE = "src/assets/suggestions.json";

function main() {
  const answers = data.map(({ answer }) => answer);
  const filteredSuggestions = suggestions.filter(
    (suggestion) => !answers.includes(suggestion),
  );

  const fileContent = JSON.stringify(filteredSuggestions, null, 2);

  writeFileSync(OUTPUT_FILE, fileContent);
}

main();
