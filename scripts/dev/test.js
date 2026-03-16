// const { writeFileSync } = require("fs");

// const answers = require("../../src/assets/data.json");
// const suggestions = require("../../src/assets/suggestions.json");

const OUTPUT_FILE = "test.json";

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

  const suggestions = ["Eiffel Tower / Gustave Eiffel / Paris, France"];

  for (const suggestion of suggestions) {
    let wikipediaLanguages;
    let wikipediaLength;
    let commonsPictures;
    let wikiarquitecturaPictures;
    console.log(suggestion);
    // const existingDay = data.find((d) => d.answer === answer);

    const projectName = suggestion
      .split(" / ")[0]
      .replace(/\(.*\)/, "")
      .trim();
    const projectNameSnakeCase = projectName.replaceAll(" ", "_");
    const projectNameKebabCase = projectName.replaceAll(" ", "-");

    const wikipediaURL = `https://en.wikipedia.org/wiki/${projectNameSnakeCase}`;
    const wikiarquitecturaURL = `https://en.wikiarquitectura.com/building/${projectNameKebabCase}/`;
    const wikicommonsURL = `https://commons.wikimedia.org/wiki/Category:${projectNameSnakeCase}`;

    const [isWikipediaUrlExisting, isWikiarquitectureUrlExisting, ...existing] =
      await areURLsExisting([
        wikipediaURL,
        wikiarquitecturaURL,
        wikicommonsURL,
      ]);

    if (isWikipediaUrlExisting) {
      console.log(wikipediaURL);
      const html = await (await fetch(wikipediaURL)).text();
      const languagesRegex = /Available in ([\d]+) languages/;
      const languagesResult = html.match(languagesRegex);
      if (languagesResult && languagesResult.length > 1) {
        wikipediaLanguages = parseInt(languagesResult[1]);
      }
      wikipediaLength = html.length;
    }

    if (isWikiarquitectureUrlExisting) {
      console.log(wikiarquitecturaURL);

      const html = await (await fetch(wikiarquitecturaURL)).text();
      const searchPictures = html.matchAll(
        /<img alt=''\s+class='gallery-item'\s+src='([^']+)'/g,
      );
      wikiarquitecturaPictures = [...searchPictures].map(
        ([, url]) => url,
      ).length;
    }

    if (existing[0]) {
      console.log(wikicommonsURL);

      const html = await (await fetch(wikicommonsURL)).text();
      const picturesRegex =
        /The following [\d,]+ files are in this category, out of ([\d,]+) total./;
      const picturesResult = html.match(picturesRegex);
      if (picturesResult && picturesResult.length > 1) {
        commonsPictures = parseInt(picturesResult[1].replaceAll(",", ""));
      }
    }

    data.push({
      wikipediaURL,
      wikipediaLanguages,
      wikipediaLength,
      wikiarquitecturaURL,
      wikiarquitecturaPictures,
      wikicommonsURL,
      commonsPictures,
    });
  }

  return data;
}

buildData().then((data) => {
  const fileContent = JSON.stringify(data, null, 2);

  console.log(fileContent);

  // writeFileSync(OUTPUT_FILE, fileContent);
});
