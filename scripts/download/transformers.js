const { uniq } = require("./utils");

const wikipediaURL =
  /^(.*\/wikipedia\/(?:commons|en)\/(?:thumb\/)?.*?)(?:\/\d{2,4}px-.*)?$/;
const patchWikipediaURL = (thumbnailURL) => {
  const match = wikipediaURL.exec(thumbnailURL);
  if (match && match.length === 2) {
    return match[1].replace("thumb/", "");
  }
  return thumbnailURL;
};

const patchWordPressURL = (thumbnailURL) =>
  thumbnailURL.replace(/[-.]\d+x\d+\.jpg/, ".jpg");

const patchArchDailyImageURL = (thumbnailURL) =>
  thumbnailURL.replace(/newsletter|\w+_jpg/, "original");

const patchFigureGroundURL = (thumbnailURL) =>
  thumbnailURL.replace(/\dt\.jpg/, ".jpg");

const patchArquitecturaVivaURL = (thumbnailURL) =>
  thumbnailURL.replace(/av_(thumb|medium)__/, "");

const patchURLs = (urls) =>
  uniq(
    urls
      .map(patchArchDailyImageURL)
      .map(patchWikipediaURL)
      .map(patchWordPressURL)
      .map(patchArquitecturaVivaURL)
      .map(patchFigureGroundURL),
  );

module.exports = {
  patchURLs,
};
