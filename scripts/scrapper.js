/* eslint-disable no-undef */
const axios = require("axios");
const { readFile, writeFile } = require("fs/promises");

const OUTPUT_FILE = "./data.json";
const INDEXES_FILE = "./indexes.json";

const MAX_BATCH_SIZE = 10;
const INDEX_ONLY = false;

const main = async () => {
  const urls = await buildIndexes();

  if (!INDEX_ONLY) {
    const result = await getBuildingInfos(urls);

    console.log(result);
  }
};

const writeToFile = (file, data) =>
  writeFile(file, JSON.stringify(data, null, 2));

const chunk = (input, size) => {
  return input.reduce((arr, item, idx) => {
    return idx % size === 0
      ? [...arr, [item]]
      : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
};

const buildIndexes = async () => {
  try {
    const existingIndexes = await readFile(INDEXES_FILE, "utf8");

    return JSON.parse(existingIndexes);
  } catch (e) {
    console.log(`${INDEXES_FILE} will be created`);
  }

  const pages = [1, 2, 3, 4, 5, 6, 7];
  const pagesUrls = pages.map(
    (page) => `https://en.wikiarquitectura.com/building/page/${page}/`
  );

  const regexBuilding =
    /"(https:\/\/en\.wikiarquitectura\.com\/building\/[\w-]+\/)"/g;

  const promises = pagesUrls.flatMap(async (url) => {
    const { data } = await axios.get(url);

    const links = [...data.matchAll(regexBuilding)]
      .map(([, link]) => link)
      .filter(
        (link) => link !== "https://en.wikiarquitectura.com/building/feed/"
      );

    return links;
  });

  const result = (await Promise.all(promises)).flat();

  await writeToFile(INDEXES_FILE, result);

  return result;
};

const getBuildingInfos = async (urls) => {
  let existing = [];
  try {
    const existingFile = await readFile(OUTPUT_FILE, "utf8");
    existing = JSON.parse(existingFile);
  } catch (e) {
    console.log(`${OUTPUT_FILE} will be created`);
  }

  const chunks = chunk(urls, MAX_BATCH_SIZE);
  const result = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`${i + 1}/${chunks.length}`);
    const batchResults = await Promise.all(
      chunks[i].flatMap(extractBuildingInfos)
    );
    result.push(...batchResults.filter(Boolean));
  }

  await writeToFile(`${OUTPUT_FILE}.save`, result);

  const formatted = result.sort(byArchitectAndName).map(format);

  const data = merge(existing, formatted);

  await writeToFile(OUTPUT_FILE, data);

  return data;
};

const merge = (existing, newData) => {
  const result = [...existing];

  newData.forEach((newItem) => {
    if (!result.includes(newItem)) {
      result.push(newItem);
    }
  });

  return result;
};

const byArchitectAndName = (a, b) => {
  if (a.architects.length > 0 && b.architects.length > 0) {
    const aArchitect = a.architects[0].split(" ");
    const aArchitectName = aArchitect[aArchitect.length - 1];

    const bArchitect = b.architects[0].split(" ");
    const bArchitectName = bArchitect[bArchitect.length - 1];

    if (aArchitectName < bArchitectName) return -1;
    if (aArchitectName > bArchitectName) return 1;

    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
  }

  if (a.architects.length === 0 && b.architects.length === 0) {
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
  }

  if (a.architects.length === 0) return 1;
  if (b.architects.length === 0) return -1;

  return 0;
};

const format = ({ title, architects, location }) =>
  `${title} ${
    architects.length > 0 ? `/ ${architects.join(", ")} /` : "/"
  } ${location}`;

const nameRegex = /<h1 class="title">(.+)<\/h1>/;
const locationRegex =
  /<div class="tag cell">Location:<\/div>\s*<div class="value cell">(.+)<\/div>/;
const architectsBlockRegex =
  /<div class="data_row architect">\s*<div class="tag cell">Architect<\/div>\s*<div class="value cell">\s*(.+)<\/div>/;

const architectsRegex =
  /<a href="https:\/\/en\.wikiarquitectura\.com\/architect\/[\w-]+\/">([^<]+)<\/a>/g;

const sanitize = (str) => str.replace(/\s+/g, " ").trim().replace(/\.$/, "");

const removeIncluded = (arr) =>
  arr.reduce(
    (acc, str) => (acc.some((s) => s.includes(str)) ? acc : [...acc, str]),
    []
  );

const extractBuildingInfos = async (
  url = "https://en.wikiarquitectura.com/building/united-nations-headquarters-in-new-york/"
) => {
  try {
    const { data } = await axios.get(url);

    const html = data.replace(/\n/g, "");

    const [, title] = html.match(nameRegex);
    const [, location] = html.match(locationRegex);
    const [, architectsBlock] = html.match(architectsBlockRegex);

    const architects = [];
    const normalized = [];
    while ((matches = architectsRegex.exec(architectsBlock))) {
      const architect = matches[1]
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
      if (!normalized.includes(architect)) {
        normalized.push(architect);
        architects.push(sanitize(matches[1]));
      }
    }

    return {
      title: sanitize(title),
      architects: removeIncluded(architects),
      location: sanitize(location),
    };
  } catch (e) {
    console.log(`Error on ${url}: ${e.message}`);
    return null;
  }
};

main();
