#!/usr/bin/node
import { writeFileSync } from "node:fs";

import data from "../../src/assets/data.json" with { type: "json" };
import suggestions from "../../src/assets/suggestions.json" with { type: "json" };

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
