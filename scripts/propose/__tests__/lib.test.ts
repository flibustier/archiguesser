import { test } from "node:test";
import assert from "node:assert/strict";

import {
  authorName,
  buildAnswer,
  buildYears,
  type CommonsFile,
  countryName,
  credit,
  type Facts,
  guessCategories,
  isUsable,
  nameKey,
  parseTarget,
  rankFiles,
} from "../lib.ts";

const facts = (overrides: Partial<Facts> = {}): Facts => ({
  label: "Villa Savoye",
  architects: ["Le Corbusier", "Pierre Jeanneret"],
  city: "Poissy",
  country: "France",
  inception: 1928,
  opening: 1931,
  instanceOf: ["villa", "museum"],
  styles: ["International Style"],
  ...overrides,
});

const file = (overrides: Partial<CommonsFile> = {}): CommonsFile => ({
  title: "File:Villa Savoye.jpg",
  url: "https://upload.wikimedia.org/x.jpg",
  page: "https://commons.wikimedia.org/wiki/File:Villa_Savoye.jpg",
  width: 3000,
  height: 2000,
  mime: "image/jpeg",
  license: "CC BY-SA 4.0",
  author: '<a href="//commons.wikimedia.org/wiki/User:Someone">Some One</a>',
  assessments: "",
  ...overrides,
});

const countries = [
  "France",
  "United States of America (USA)",
  "United Kingdom (UK)",
  "China",
];

test("countries are named like in data.json", () => {
  assert.equal(countryName("France", countries), "France");
  assert.equal(
    countryName("United States", countries),
    "United States of America (USA)",
  );
  assert.equal(countryName("United Kingdom", countries), "United Kingdom (UK)");
  assert.equal(countryName("People's Republic of China", countries), "China");
  assert.equal(countryName("Bhutan", countries), "Bhutan");
  assert.equal(countryName(undefined, countries), "");
});

test("the answer has the name, the architects and the place", () => {
  assert.equal(
    buildAnswer(facts(), countries),
    "Villa Savoye / Le Corbusier, Pierre Jeanneret / Poissy, France",
  );
  assert.equal(
    buildAnswer(
      facts({
        architects: [],
        city: undefined,
        country: "Peru",
        label: "Machu Picchu",
      }),
      countries,
    ),
    "Machu Picchu / Peru",
  );
});

test("years are a range, a single year, or nothing", () => {
  assert.equal(buildYears(facts()), "1928-1931");
  assert.equal(buildYears(facts({ opening: undefined })), "1928");
  assert.equal(buildYears(facts({ opening: 1928 })), "1928");
  assert.equal(
    buildYears(facts({ inception: -447, opening: -432 })),
    "447 BC-432 BC",
  );
  assert.equal(
    buildYears(facts({ inception: undefined, opening: undefined })),
    "",
  );
});

test("categories are guessed from classes and styles", () => {
  assert.deepEqual(guessCategories(facts()), ["museum", "modernism"]);
  assert.deepEqual(
    guessCategories(
      facts({
        instanceOf: ["cathedral", "tourist attraction"],
        styles: ["Gothic"],
      }),
    ),
    ["religious"],
  );
  assert.deepEqual(
    guessCategories(facts({ instanceOf: ["house"], styles: [] })),
    [],
  );
});

test("only large pictures under a free licence are usable", () => {
  assert.equal(isUsable(file()), true);
  assert.equal(isUsable(file({ license: "CC0" })), true);
  assert.equal(isUsable(file({ license: "Public domain" })), true);
  assert.equal(isUsable(file({ license: "CC BY 2.0" })), true);
  assert.equal(isUsable(file({ license: "CC BY-NC 2.0" })), false);
  assert.equal(isUsable(file({ license: "Copyrighted free use" })), false);
  assert.equal(isUsable(file({ license: "" })), false);
  assert.equal(isUsable(file({ width: 800, height: 600 })), false);
  assert.equal(isUsable(file({ mime: "image/svg+xml" })), false);
});

test("featured and quality pictures come first, then the largest", () => {
  const ranked = rankFiles([
    file({ title: "small", width: 1500, height: 1000 }),
    file({ title: "large" }),
    file({
      title: "quality",
      width: 1500,
      height: 1000,
      assessments: "quality",
    }),
    file({
      title: "featured",
      width: 1300,
      height: 1000,
      assessments: "featured|quality",
    }),
    file({
      title: "not free",
      license: "All rights reserved",
      assessments: "featured",
    }),
  ]);

  assert.deepEqual(
    ranked.map(({ title }) => title),
    ["featured", "quality", "large", "small"],
  );
});

test("credits name the author without markup", () => {
  assert.equal(
    authorName('<a href="x">Benh&nbsp;LIEU  SONG</a>'),
    "Benh LIEU SONG",
  );
  assert.equal(credit(file()), "Some One (wikimedia)");
  assert.equal(credit(file({ author: "" })), "wikimedia");
});

test("nameKey ignores case, accents and the part in brackets", () => {
  assert.equal(
    nameKey("Peak Tower (凌霄閣) / Terry Farrell / Hong Kong"),
    "peak tower",
  );
  assert.equal(nameKey("Château de Chambord / France"), "chateau de chambord");
});

test("the target is a Wikidata id or a Wikipedia address", () => {
  assert.deepEqual(parseTarget("q243"), { qid: "Q243" });
  assert.deepEqual(parseTarget("https://www.wikidata.org/wiki/Q243"), {
    qid: "Q243",
  });
  assert.deepEqual(
    parseTarget("https://fr.wikipedia.org/wiki/Tour_Eiffel#Histoire"),
    {
      lang: "fr",
      title: "Tour Eiffel",
    },
  );
  assert.equal(parseTarget("Eiffel Tower"), undefined);
});
