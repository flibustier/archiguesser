import axios from "axios";
import process from "node:process";
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { filename } from "./utils.js";
import { patchURLs } from "./transformers.js";
import { extractImageURLs } from "./parsing.js";

// some https website have no intermediate certificate, causing axios panic error
// as we are only fetching from this website without sensible data, we can simply disable tls encryption
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const main = async () => {
  const { url, destinationDirectory } = extractArguments();

  createDirectoryIfNotExisting(destinationDirectory);

  const { data: html } = await axios.get(url);
  const originalURLs = extractImageURLs(url, html);
  const patchedURLs = patchURLs(originalURLs);

  const success = await downloadFileList(
    patchedURLs,
    originalURLs,
    destinationDirectory,
  );

  console.log(`🏆 ${success}/${originalURLs.length} images downloaded !`);
};

const extractArguments = () => {
  if (process.argv.length < 4) {
    console.log(`Usage: download [URL] [DESTINATION_DIRECTORY]`);

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

const downloadFileList = async (
  patchedURLs,
  originalURLs,
  destinationDirectory,
) => {
  const download = downloadFile(destinationDirectory);

  const firstPass = await Promise.allSettled(patchedURLs.map(download));

  const secondPass = await Promise.allSettled(
    firstPass.map(({ status }, index) => {
      if (status === "fulfilled") {
        return Promise.resolve();
      }

      // fallback for image not found in "original" quality
      const fallbackURL = patchedURLs[index].includes("original")
        ? patchedURLs[index].replace("original", "large_jpg")
        : originalURLs[index];
      console.log(`Fallback => ${fallbackURL}`);

      return download(fallbackURL, index);
    }),
  );

  return secondPass.filter(({ status }) => status === "fulfilled").length;
};

const downloadFile = (directory) => (url, index) =>
  axios({
    method: "get",
    url: url.startsWith("//") ? `https:${url}` : url,
    responseType: "stream",
  }).then((response) => {
    let file = filename(url);
    if (file === "stringio.jpg") {
      file = `x${index}-` + file;
    }

    return response.data.pipe(createWriteStream(`./${directory}/${file}`));
  });

// if (import.meta.main) {
main();
// }
