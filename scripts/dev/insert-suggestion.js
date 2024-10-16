#!/usr/bin/node
import process from "node:process";
import { writeFileSync } from "node:fs";

import suggestions from "../../src/assets/suggestions.json" with { type: "json" };

const OUTPUT_FILE = "src/assets/suggestions.json";

const extractArguments = () => {
  if (process.argv.length < 3) {
    console.log(`Usage: yarn insert [SUGGESTION]`);

    process.exit(1);
  }

  return process.argv[2];
};

const extractMainArchitectName = (suggestion) => {
  const architects = suggestion.split("/")[1];

  const mainArchitect = architects.split(",")[0].trim();

  const lastName = mainArchitect.split(" ").pop().toLowerCase();

  return lastName;
};

function main() {
  const suggestion = extractArguments();

  const architectName = extractMainArchitectName(suggestion);

  const index = suggestions.findIndex(
    (suggestion) =>
      architectName.localeCompare(extractMainArchitectName(suggestion)) < 0,
  );

  const newSuggestions = [
    ...suggestions.slice(0, index),
    suggestion,
    ...suggestions.slice(index),
  ];

  const fileContent = JSON.stringify(newSuggestions, null, 2);

  writeFileSync(OUTPUT_FILE, fileContent);
}

main();
