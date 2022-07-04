/* eslint-disable no-undef */
const metadata = require("../src/assets/metadata.json");
const suggestions = require("../src/assets/suggestions.json");

for (const key in metadata) {
  if (!suggestions.includes(metadata[key].name)) {
    throw new Error(
      `${key} : "${metadata[key].name}" is missing from suggestions.json!`
    );
  }
}

console.log("✅ everything looks good!");
