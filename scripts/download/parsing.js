const { uniq } = require("./utils");

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

const decodeHTMLentities = (url) => url.replaceAll("&#39;", "'");

const blacklistURLs = (imageURL) => !imageURL.startsWith("//assets.adsttc.com");

const imageRegex =
  /['"](?:https?:)?(\/\/?[./\w\d_'&©#;%-]+?\.(?:jpg|JPG|jpeg|JPEG|webp))\??[^'"]*['"]/g;
const captionRegex = /<figcaption .* id='(.*)'>([^<]*)<\/figcaption>/g;

const extractImageURLs = (url, html) => {
  const imageURLs = uniq(
    [...html.matchAll(imageRegex)]
      .map(handleRelativeURL(url))
      .map(decodeHTMLentities)
      .filter(blacklistURLs),
  );

  console.log(imageURLs);

  return imageURLs.slice(0);
};

const patchArchDailyID = (imageID) =>
  imageID
    .replace("figcaption_newsroom-picture-att-id-", "")
    .match(/.{1,4}/g)
    .join("/");

const extractCopyrights = (imageURLs, html) => {
  const copyrights = [...html.matchAll(captionRegex)].reduce(
    (others, [, id, copyrights]) => ({
      ...others,
      [imageURLs.findIndex((imageURL) =>
        imageURL.includes(patchArchDailyID(id)),
      )]: copyrights,
    }),
    {},
  );

  console.log(JSON.stringify(copyrights, null, 2));

  return copyrights;
};

module.exports = {
  extractImageURLs,
  extractCopyrights,
};
