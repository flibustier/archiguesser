import { test } from "node:test";
import assert from "node:assert/strict";

import { escapeRegExp, highlight, normalize, search } from "../search.ts";

const suggestions = [
  "Eiffel Tower / Gustave Eiffel / Paris, France",
  "Notre-Dame-de-la-Garde / Henri-Jacques Espérandieu / Marseille, France",
  "Château de Chambord / Domenico da Cortona / Chambord, France",
  "Tower Bridge / Horace Jones, John Wolfe Barry / London, United Kingdom (UK)",
  "L’Arbre Blanc / Sou Fujimoto / Montpellier, France",
];

const names = (terms: string) =>
  search(terms, suggestions).map(({ suggestion }) => suggestion.split(" /")[0]);

test("normalize ignores case, accents, hyphens and apostrophes", () => {
  assert.equal(normalize("Château"), "chateau");
  assert.equal(normalize("Notre-Dame-de-la-Garde"), "notre dame de la garde");
  assert.equal(normalize("L’Arbre d'Or"), "larbre dor");
  assert.equal(normalize("SESC (Pompéia) [1986]"), "sesc pompeia 1986");
  assert.equal(normalize("Øresund + Bridge"), "oresund   bridge");
});

test("escapeRegExp neutralises regular expression syntax", () => {
  assert.equal(escapeRegExp("c++ (v2)*"), "c\\+\\+ \\(v2\\)\\*");
  assert.doesNotThrow(() => new RegExp(escapeRegExp("**|??[")));
});

test("search finds by name, architect or place", () => {
  assert.deepEqual(names("eiffel"), ["Eiffel Tower"]);
  assert.deepEqual(names("fujimoto"), ["L’Arbre Blanc"]);
  assert.deepEqual(names("london"), ["Tower Bridge"]);
});

test("search ranks whole words and multiple matches first", () => {
  // "tower" is a whole word of both; "eiffel" only matches the first
  assert.deepEqual(names("eiffel tower"), ["Eiffel Tower", "Tower Bridge"]);
});

test("search ignores accents and hyphens", () => {
  assert.deepEqual(names("chateau chambord"), ["Château de Chambord"]);
  assert.deepEqual(names("dame garde"), ["Notre-Dame-de-la-Garde"]);
  assert.deepEqual(names("arbre blanc"), ["L’Arbre Blanc"]);
});

test("search ignores words of one letter and empty input", () => {
  assert.deepEqual(names(""), []);
  assert.deepEqual(names("e"), []);
});

test("search survives regular expression characters", () => {
  assert.doesNotThrow(() => search("paris **", suggestions));
  assert.doesNotThrow(() => search("eiffel ??", suggestions));
  assert.doesNotThrow(() => search("tower (uk", suggestions));
  assert.deepEqual(names("eiffel ??"), ["Eiffel Tower"]);
});

test("search returns at most 30 suggestions, best first", () => {
  const many = Array.from({ length: 50 }, (_, i) => `Tower ${i} / Paris`);
  const results = search("tower 49", [...many]);

  assert.equal(results.length, 30);
  assert.equal(results[0].suggestion, "Tower 49 / Paris");
});

test("highlight marks the words and escapes the rest", () => {
  assert.equal(
    highlight("Eiffel Tower", ["eiffel"]),
    "<mark>Eiffel</mark> Tower",
  );
  assert.equal(
    highlight("A & B <i>", ["b"], "b"),
    "A &amp; <b>B</b> &lt;i&gt;",
  );
  assert.equal(highlight("Tower (UK)", ["(UK)"]), "Tower <mark>(UK)</mark>");
  assert.equal(highlight("plain", []), "plain");
});
