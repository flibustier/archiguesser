/* eslint-disable no-undef */
const axios = require("axios");
const { createWriteStream, existsSync, mkdirSync } = require("fs");
const { basename, join } = require("path");

const main = async () => {
  if (process.argv.length < 4) {
    console.log(
      `Usage: yarn download [WIKIARQUITECTURA_URL] [DESTINATION_DIRECTORY]`
    );
  }

  const wikiURL = process.argv[2];
  const destinationDirectory = join("sources", process.argv[3]);

  if (!existsSync(destinationDirectory)) {
    console.log(`ℹ️  ${destinationDirectory} created`);
    mkdirSync(destinationDirectory);
  }

  const imageURLs = await extractImageURLs(wikiURL);

  await Promise.all(imageURLs.map(downloadFile(destinationDirectory)));

  console.log(`✅ ${imageURLs.length} images downloaded !`);
};

const downloadFile = (directory) => (url) =>
  axios({
    method: "get",
    url,
    responseType: "stream",
  }).then((response) =>
    response.data.pipe(createWriteStream(`./${directory}/${basename(url)}`))
  );

const imageRegex = /'(https.+)\-\d+x\d+\.jpg\??[^']*'/g;

const extractImageURLs = async (
  url = "https://en.wikiarquitectura.com/building/cube-houses/"
) => {
  try {
    const { data: html } = await axios.get(url);

    const imageURLs = [...html.matchAll(imageRegex)].map(
      ([, extracted]) => extracted + ".jpg"
    );

    return imageURLs;
  } catch (e) {
    console.log(`Error on ${url}: ${e.message}`);

    return [];
  }
};

main();
