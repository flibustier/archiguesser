/* eslint-disable no-undef */
const axios = require("axios");
const { createWriteStream, existsSync, mkdirSync } = require("fs");
const { basename, join } = require("path");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

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
      createWriteStream(`./${directory}/x${index}-${basename(url)}`)
    )
  );

const uniq = (array) => [...new Set(array)];

const removeUnwantedURLs = (imageURL) =>
  !imageURL.startsWith("//assets.adsttc.com");

const patchWikipediaURL = (thumbnailURL) => thumbnailURL.replace("thumb/", "");

const patchWikiArquitecturaURL = (thumbnailURL) =>
  thumbnailURL.replace(/-\d+x\d+\.jpg/, ".jpg");

const patchArchDailyImageURL = (thumbnailURL) =>
  thumbnailURL.replace(/newsletter|\w+_jpg/, "original");

const patchArchDailyID = (imageID) =>
  imageID
    .replace("figcaption_newsroom-picture-att-id-", "")
    .match(/.{1,4}/g)
    .join("/");

const patchFigureGroundURL = (thumbnailURL) =>
  thumbnailURL.replace(/\dt\.jpg/, ".jpg");

const patchArquitecturaVivaURL = (thumbnailURL) =>
  thumbnailURL.replace(/av_(thumb|medium)__/, "");

const handleRelativeURL =
  (rootURL) =>
  ([, imageURL]) => {
    if (imageURL.startsWith("//")) {
      // already Absolute URL
      return imageURL;
    }
    // relative URL -> Absolute URL
    return "//" + new URL(rootURL).hostname + imageURL;
  };

const imageRegex =
  /['"](?:https?:)?(\/\/?[\.\/\w\d_%-]+?\.(?:jpg|JPG|jpeg|JPEG))\??[^'"]*['"]/g;
const captionRegex = /<figcaption .* id=\'(.*)\'>([^<]*)<\/figcaption>/g;

const extractImageURLs = async (
  url = "https://en.wikiarquitectura.com/building/cube-houses/"
) => {
  try {
    const { data: html } = await axios.get(url);

    const imageURLs = uniq(
      [...html.matchAll(imageRegex)]
        .map(handleRelativeURL(url))
        .map(patchArchDailyImageURL)
        .map(patchWikipediaURL)
        .map(patchWikiArquitecturaURL)
        .map(patchArquitecturaVivaURL)
        .map(patchFigureGroundURL)
        .filter(removeUnwantedURLs)
    );

    const copyrights = [...html.matchAll(captionRegex)].reduce(
      (others, [, id, copyrights]) => ({
        ...others,
        [imageURLs.findIndex((imageURL) =>
          imageURL.includes(patchArchDailyID(id))
        )]: copyrights,
      }),
      {}
    );

    console.log(imageURLs, JSON.stringify(copyrights, null, 2));

    return imageURLs;
  } catch (e) {
    console.log(`Error on ${url}: ${e.message}`);

    return [];
  }
};

main();
