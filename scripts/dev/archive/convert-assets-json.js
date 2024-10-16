import { writeFileSync } from "node:fs" with { type: "json" };

import answers from "../../src/assets/answers.json" with { type: "json" };
import years from "../../src/assets/years.json" with { type: "json" };
import copyrights from "../../src/assets/copyrights.json" with { type: "json" };
import monuments from "../../src/assets/monuments.json" with { type: "json" };
import links from "../../src/assets/links.json" with { type: "json" };
import suggestions from "../../../src/assets/suggestions.json" with { type: "json" };

const OUTPUT_FILE = "src/assets/data.json";

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

const areURLsExisting = (urls) =>
  Promise.all(
    urls.map(async (url) =>
      fetch(url, {
        method: "HEAD",
      }).then(({ status }) => status === 200),
    ),
  );

async function buildData() {
  const data = [];
  const notFoundURLs = [0, 0];
  const yearsError = [];

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

    const currentLinks = links[day] || [];
    let currentYears = years[day];

    if (!currentLinks.length) {
      const projectName = answer
        .split(" / ")[0]
        .replace(/\(.*\)/, "")
        .trim();
      const wikipediaURL = `https://en.wikipedia.org/wiki/${projectName.replaceAll(
        " ",
        "_",
      )}`;
      const wikiarquitecturaURL = `https://en.wikiarquitectura.com/building/${projectName.replaceAll(
        " ",
        "-",
      )}/`;

      const existingURLs = await areURLsExisting([
        wikipediaURL,
        wikiarquitecturaURL,
      ]);

      if (existingURLs[0]) {
        currentLinks.push(wikipediaURL);
      } else {
        notFoundURLs[0]++;
        console.log(`🧐 ${wikipediaURL}`);
      }

      if (existingURLs[1]) {
        currentLinks.push(wikiarquitecturaURL);
        if (!currentYears) {
          // extract built in years from wikiarquitectura
          const html = await (await fetch(wikiarquitecturaURL)).text();
          const searchYears = html.match(/Year:<\/div>[^>]*>([\d\s-]+)</);
          if (searchYears && searchYears.length > 1) {
            currentYears = searchYears[1].replace(" ", "");
          } else {
            yearsError.push(wikiarquitecturaURL);
          }
        }
      } else {
        notFoundURLs[1]++;
        console.log(`🧐 ${wikiarquitecturaURL}`);
      }
    }

    data.push({
      answer,
      days: [dayNumber],
      copyrights: [copyrights[day]],
      years: currentYears,
      links: currentLinks,
      categories: monuments.includes(dayNumber) ? ["monument"] : [],
    });
  }

  console.log(`⚠️ ${notFoundURLs} not found URLs!`);
  console.log(yearsError);

  return data;
}

buildData().then((data) => {
  const fileContent = JSON.stringify(data, null, 2);

  //console.log(fileContent);

  writeFileSync(OUTPUT_FILE, fileContent);
});
