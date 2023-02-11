/* eslint-disable no-undef */
const axios = require("axios");
const { createWriteStream, existsSync, mkdirSync } = require("fs");
const { basename, join } = require("path");

const main = async () => {
  const { url, destinationDirectory } = extractArguments();

  createDirectoryIfNotExisting(destinationDirectory);

  const imageURLs = await extractImageURLs(url);

  const success = await downloadFileList(imageURLs, destinationDirectory);

  console.log(`🏆 ${success}/${imageURLs.length} images downloaded !`);
};

const extractArguments = () => {
  if (process.argv.length < 4) {
    console.log(`Usage: yarn download [URL] [DESTINATION_DIRECTORY]`);

    process.exit(1);
  }

  return {
    url: process.argv[2],
    destinationDirectory: join("sources", process.argv[3]),
  };
};

const createDirectoryIfNotExisting = (directory) => {
  if (!existsSync(directory)) {
    console.log(`ℹ️  ${directory} created`);
    mkdirSync(directory);
  }
};

const downloadFileList = async (imageURLs, destinationDirectory) => {
  const download = downloadFile(destinationDirectory);

  const firstPass = await Promise.allSettled(imageURLs.map(download));

  const secondPass = await Promise.allSettled(
    firstPass.map(({ status }, index) => {
      if (status === "fulfilled") {
        return Promise.resolve();
      }

      const fallbackURL = imageURLs[index].replace("original", "slideshow");
      console.log(`🥈 Fallback => ${fallbackURL}`);

      return download(fallbackURL, index);
    })
  );

  return secondPass.filter(({ status }) => status === "fulfilled").length;
};

const downloadFile = (directory) => (url, index) =>
  axios({
    method: "get",
    url,
    responseType: "stream",
  }).then((response) =>
    response.data.pipe(
      createWriteStream(`./${directory}/${index}-${basename(url)}`)
    )
  );

const uniq = (array) => [...new Set(array)];

const patchWikiArquitecturaURL = (thumbnailURL) =>
  thumbnailURL.replace(/-\d+x\d+\.jpg/, ".jpg");

const patchArchDailyImageURL = (thumbnailURL) =>
  thumbnailURL.replace(/newsletter|\w+_jpg/, "original");

const imageRegex = /'(https:[\.\/\w\d_-]+\.jpg)\??[^']*'/g;

const extractImageURLs = async (
  url = "https://en.wikiarquitectura.com/building/cube-houses/"
) => {
  try {
    const { data: html } = await axios.get(url);

    const imageURLs = uniq(
      [...html.matchAll(imageRegex)]
        .map(([, extracted]) => patchArchDailyImageURL(extracted))
        .map(patchWikiArquitecturaURL)
    );

    return imageURLs;
  } catch (e) {
    console.log(`Error on ${url}: ${e.message}`);

    return [];
  }
};

main();
