import { test } from "node:test";
import assert from "node:assert/strict";

import { dayExists, replayableDays, resolveDay } from "../days.ts";
import { suggestionsFor } from "../suggestions.ts";

const index = {
  lastDay: 12,
  missingDays: [5, 10],
  monumentDays: [],
  categories: [],
};

test("dayExists knows the gaps of the collection", () => {
  assert.equal(dayExists(0, index), true);
  assert.equal(dayExists(5, index), false);
  assert.equal(dayExists(12, index), true);
  assert.equal(dayExists(13, index), false);
  assert.equal(dayExists(-1, index), false);
  assert.equal(dayExists(NaN, index), false);
});

test("resolveDay plays the requested day when it exists", () => {
  assert.equal(resolveDay(3, 11, index), 3);
  // prepared in advance: playable in development
  assert.equal(resolveDay(12, 11, index), 12);
});

test("resolveDay falls back on the last published day", () => {
  assert.equal(resolveDay(5, 11, index), 11);
  // today has no project: yesterday's, or the day before
  assert.equal(resolveDay(10, 10, index), 9);
  // the collection stops before today
  assert.equal(resolveDay(40, 40, index), 12);
  assert.equal(resolveDay(NaN, 11, index), 11);
});

test("replayableDays lists the last days, without the skipped ones", () => {
  assert.deepEqual(replayableDays(10, [7, 8], 5), [9, 6, 5, 4, 3]);
  assert.deepEqual(replayableDays(3, [], 60), [2, 1, 0]);
  assert.deepEqual(replayableDays(0, [], 60), []);
});

const answers = [
  "Eiffel Tower / Gustave Eiffel / Paris, France",
  "Louvre Pyramid / Ieoh Ming Pei / Paris, France",
  "United Nations Headquarters / Le Corbusier, Oscar Niemeyer / New York, United States of America (USA)",
  "Machu Picchu / Peru",
];

test("a normal day offers the full answers", () => {
  assert.equal(suggestionsFor(undefined, answers), answers);
});

test("a City hors-série offers each city once", () => {
  assert.deepEqual(suggestionsFor("City", answers), [
    "Paris, France",
    "New York, United States of America (USA)",
  ]);
});

test("an Architect hors-série offers each architect once", () => {
  assert.deepEqual(suggestionsFor("Architect", answers), [
    "Gustave Eiffel",
    "Ieoh Ming Pei",
    "Le Corbusier",
    "Oscar Niemeyer",
  ]);
});
