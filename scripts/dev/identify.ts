import { compareTwoStrings } from "https://deno.land/x/string_similarity@v1.0.1/mod.ts";

import ADClassics from "./ADClassics.json" with { type: "json" };
import data from "../../src/assets/data.json" with { type: "json" };

const THRESHOLD = 0.6;
const CATEGORY = "Architecture Classics";

const answers = data.map(({ days, answer }) => {
  const splitted = answer.split("/");

  return {
    name: splitted[0],
    architects: splitted[1],
    id: days[0],
  };
});

const adclassics = ADClassics.map((answer) => answer.split("/")).filter(
  (x) => x.length > 1
);

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "");
}

const tagId = (dayNumber: number) => {
  const project = data.find(({ days }) => days.includes(dayNumber));

  if (project && !project.categories.includes(CATEGORY)) {
    project.categories.push(CATEGORY);
  }
};

let matchCount = 0;

for (const adProject of adclassics) {
  for (const ansProject of answers) {
    const nameSimilarity = compareTwoStrings(
      normalizeString(adProject[0]),
      normalizeString(ansProject.name)
    );
    const architectsSimilarity = compareTwoStrings(
      normalizeString(adProject[1]),
      normalizeString(ansProject.architects)
    );

    if (nameSimilarity > THRESHOLD && architectsSimilarity > THRESHOLD) {
      matchCount++;
      console.log("Potential match found:");
      console.log("ADClassics:", adProject);
      console.log("answers.json:", ansProject);
      console.log("Name similarity:", nameSimilarity);
      console.log("Architects similarity:", architectsSimilarity);
      console.log("---");
      tagId(ansProject.id);
    }
  }
}

console.log("Total matches found:", matchCount);

Deno.writeTextFileSync("src/assets/data.json", JSON.stringify(data, null, 2));
