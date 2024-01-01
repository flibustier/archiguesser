const patchWikipediaURL = (thumbnailURL) => thumbnailURL.replace("thumb/", "");

const patchWordPressURL = (thumbnailURL) =>
  thumbnailURL.replace(/[-.]\d+x\d+\.jpg/, ".jpg");

const patchArchDailyImageURL = (thumbnailURL) =>
  thumbnailURL.replace(/newsletter|\w+_jpg/, "original");

const patchFigureGroundURL = (thumbnailURL) =>
  thumbnailURL.replace(/\dt\.jpg/, ".jpg");

const patchArquitecturaVivaURL = (thumbnailURL) =>
  thumbnailURL.replace(/av_(thumb|medium)__/, "");

const patchURLs = (urls) =>
  urls
    .map(patchArchDailyImageURL)
    .map(patchWikipediaURL)
    .map(patchWordPressURL)
    .map(patchArquitecturaVivaURL)
    .map(patchFigureGroundURL);

module.exports = {
  patchURLs,
};
