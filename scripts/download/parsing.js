import { uniq, filename } from "./utils.js";

const handleRelativeURL =
  (rootURL) =>
  ([, imageURL]) => {
    if (imageURL.startsWith("//")) {
      // already Absolute URL
      return imageURL;
    }
    // relative URL -> Absolute URL
    return (
      "//" +
      new URL(rootURL).hostname +
      (imageURL.startsWith("/") ? "" : "/") +
      imageURL
    );
  };

const decodeHTMLentities = (url) =>
  decodeURI(url)
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("%2C", ",");

const blacklistURLs = (imageURL) =>
  !(
    imageURL.startsWith("//assets.adsttc.com") ||
    imageURL.startsWith("//snoopy.archdaily.com")
  );

const imageRegex =
  /['"\s](?:https?:)?(\/?\/?[./\w\d_'&©#,;%-]+?\.(?:jpg|JPG|jpeg|JPEG|webp)\??[^'"\s]*)['"\s]/g;
const captionRegex = /<figcaption .* id='(.*)'>([^<]*)<\/figcaption>/g;

export const extractImageURLs = (url, html) => {
  const imageURLs = uniq(
    [...html.matchAll(imageRegex)]
      .map(handleRelativeURL(url))
      .map(decodeHTMLentities)
      .filter(blacklistURLs),
  )
    .reduce(selectBestQualityWhenSameFileName, [])
    .map(({ url }) => url);

  console.log(imageURLs);

  return imageURLs.slice(0);
};

const selectBestQualityWhenSameFileName = (filtered, currentURL) => {
  const currentFileName = filename(currentURL);
  const params = new URLSearchParams(currentURL);
  const width = parseInt(params.get("w") || "0");
  const current = {
    filename: currentFileName,
    url: currentURL,
    width,
  };

  const sameFileNameExists = filtered.findIndex(
    ({ filename }) =>
      filename === currentFileName && filename !== "stringio.jpg",
  );

  if (sameFileNameExists === -1) {
    filtered.push(current);
  } else if (width > filtered[sameFileNameExists].width) {
    filtered[sameFileNameExists] = current;
  }

  return filtered;
};

const patchArchDailyID = (imageID) =>
  imageID
    .replace("figcaption_newsroom-picture-att-id-", "")
    .match(/.{1,4}/g)
    .join("/");

export const extractCopyrights = (imageURLs, html) => {
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
