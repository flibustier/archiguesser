import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { renderPage, staticPages } from "../pages.ts";

const template = readFileSync(
  new URL("../../index.html", import.meta.url),
  "utf8",
);
const index = {
  lastDay: 3,
  missingDays: [],
  monumentDays: [],
  categories: [
    { name: "United Kingdom (UK)", slug: "united-kingdom-uk", count: 10 },
    { name: "test", slug: "test", count: 1 },
  ],
};
const pages = staticPages(index, [1, 2, 3], (day) => (day === 3 ? 1 : day));
const find = (path: string) => pages.find((page) => page.path === path)!;

test("every URL of the app has its page", () => {
  assert.deepEqual(
    pages.map(({ file }) => file),
    [
      "replay.html",
      "challenges.html",
      "score.html",
      "account.html",
      "about.html",
      "day/1.html",
      "day/2.html",
      "day/3.html",
      "challenge/united-kingdom-uk.html",
    ],
  );
});

test("a day page previews the first picture of the day it replays", () => {
  assert.equal(find("/day/2").image, "/2/1.jpg");
  assert.equal(find("/day/3").image, "/1/1.jpg");
});

test("renderPage sets title, canonical URL and preview on the real index.html", () => {
  const html = renderPage(template, find("/day/3"), "https://archiguesser.com");

  assert.match(
    html,
    /<title>ArchiGuesser #3 - Guess the architectural project from the pictures<\/title>/,
  );
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/archiguesser\.com\/day\/3"/,
  );
  assert.match(
    html,
    /<meta property="og:url" content="https:\/\/archiguesser\.com\/day\/3"/,
  );
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/archiguesser\.com\/1\/1\.jpg"/,
  );
  assert.match(
    html,
    /<meta name="description" content="Can you guess the architectural project #3/,
  );
  // the app itself is untouched
  assert.match(html, /<div id="app"><\/div>/);
});

test("renderPage keeps the default description and image when a page has none", () => {
  const html = renderPage(template, find("/score"), "https://archiguesser.com");

  assert.match(html, /<title>ArchiGuesser - Your score<\/title>/);
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/archiguesser\.com\/preview\.png"/,
  );
  assert.match(
    html,
    /<meta name="description" content="The best architecture daily game!/,
  );
});

test("renderPage escapes names", () => {
  const html = renderPage(
    template,
    { file: "x.html", path: "/x", title: 'A "B" & <C>' },
    "https://archiguesser.com",
  );

  assert.match(html, /<title>A &quot;B&quot; &amp; &lt;C><\/title>/);
});
