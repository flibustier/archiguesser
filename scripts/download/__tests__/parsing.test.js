const assert = require("assert");
const { describe, it } = require("node:test");

const { extractImageURLs } = require("../parsing");

describe("download script", () => {
  it("should do nothing if page is empty", () => {
    assert.deepEqual(extractImageURLs("", ""), []);
  });

  it("should extract image URLs with html entity encoded", () => {
    const html = `data-src='https://images.adsttc.com/media/images/5281/8b54/e8e4/4e95/f600/010f/thumb_jpg/Werlemann_Villa_Dall&#39;Ava2.jpg?1384221516'`;

    const urls = extractImageURLs(
      "https://www.archdaily.com/448320/ad-classics-villa-dall-ava-oma",
      html,
    );

    assert.deepEqual(urls, [
      "//images.adsttc.com/media/images/5281/8b54/e8e4/4e95/f600/010f/original/Werlemann_Villa_Dall'Ava2.jpg",
    ]);
  });

  it("should extract original photo from wikiarquitectura", () => {
    const html = `<img alt='' class='gallery-item' src='https://en.wikiarquitectura.com/wp-content/uploads/2017/01/01_Pre-Armado_Puente-205x205.jpg'>`;

    const urls = extractImageURLs(
      "https://en.wikiarquitectura.com/building/bridge-in-zapallar/",
      html,
    );

    assert.deepEqual(urls, [
      "//en.wikiarquitectura.com/wp-content/uploads/2017/01/01_Pre-Armado_Puente.jpg",
    ]);
  });
});
