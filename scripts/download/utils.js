const { basename } = require("path");

const uniq = (array) => [...new Set(array)];
const filename = (url) => basename(url.split("?")[0]);

module.exports = {
  uniq,
  filename,
};
