import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildAnswers,
  buildChallenge,
  buildDay,
  buildIndex,
  copyrightsOf,
  projectsOfCategory,
  validate,
} from "../game-data.ts";
import { slugify } from "../../src/services/slug.ts";
import type { Project } from "../../src/services/types.ts";

const project = (overrides: Partial<Project>): Project => ({
  answer: "Villa Savoye / Le Corbusier / Poissy, France",
  days: [1],
  copyrights: [{ "*": "someone" }],
  years: "1928-1931",
  links: ["https://en.wikipedia.org/wiki/Villa_Savoye"],
  categories: [],
  ...overrides,
});

const projects: Project[] = [
  project({
    days: [1, 40, 90],
    copyrights: [{ "*": "first" }, { "*": "second" }],
  }),
  project({
    answer: "Eiffel Tower / Gustave Eiffel / Paris, France",
    days: [2],
    categories: ["monument", "famous"],
    hints: false,
  }),
  project({
    answer:
      "Fallingwater / Frank Lloyd Wright / Mill Run, United States of America (USA)",
    days: [4],
    categories: ["famous"],
    "hors-serie": "Architect",
  }),
];

test("slugify makes URL-friendly names", () => {
  assert.equal(
    slugify("United States of America (USA)"),
    "united-states-of-america-usa",
  );
  assert.equal(slugify("concert hall"), "concert-hall");
  assert.equal(slugify("Le Corbusier"), "le-corbusier");
  assert.equal(slugify("Café Müller"), "cafe-muller");
});

test("a day gets the copyrights of its own airing", () => {
  assert.deepEqual(copyrightsOf(projects[0], 1), { "*": "first" });
  assert.deepEqual(copyrightsOf(projects[0], 40), { "*": "second" });
  // no third entry: the last one is reused
  assert.deepEqual(copyrightsOf(projects[0], 90), { "*": "second" });
});

test("buildDay keeps what a daily game needs", () => {
  assert.deepEqual(buildDay(projects, 2), {
    dayNumber: 2,
    answer: "Eiffel Tower / Gustave Eiffel / Paris, France",
    constructionYears: "1928-1931",
    copyrights: { "*": "someone" },
    links: ["https://en.wikipedia.org/wiki/Villa_Savoye"],
    categories: ["monument", "famous"],
    isMonument: true,
    noHints: true,
    recommendation: undefined,
    credits: undefined,
    "hors-serie": undefined,
    features: undefined,
  });
  assert.equal(buildDay(projects, 4)?.["hors-serie"], "Architect");
  assert.equal(buildDay(projects, 3), undefined);
});

test("a category is a tag, or else a word of the answer", () => {
  assert.equal(projectsOfCategory(projects, "famous").length, 2);
  assert.equal(projectsOfCategory(projects, "France").length, 2);
  assert.equal(projectsOfCategory(projects, "Le Corbusier").length, 1);
  assert.equal(projectsOfCategory(projects, "castle").length, 0);
});

test("buildChallenge uses the first airing of each project", () => {
  assert.deepEqual(buildChallenge(projects, "Le Corbusier"), [
    {
      answer: "Villa Savoye / Le Corbusier / Poissy, France",
      day: 1,
      copyrights: { "*": "first" },
      links: ["https://en.wikipedia.org/wiki/Villa_Savoye"],
    },
  ]);
});

test("buildAnswers merges answers and decoys without duplicates", () => {
  assert.deepEqual(
    buildAnswers(projects.slice(0, 2), [
      "Decoy / Nobody / Nowhere",
      projects[0].answer,
    ]),
    [projects[0].answer, projects[1].answer, "Decoy / Nobody / Nowhere"],
  );
});

test("buildIndex summarises the collection", () => {
  assert.deepEqual(buildIndex(projects, ["famous", "France"]), {
    lastDay: 90,
    missingDays: [...Array(91).keys()].filter(
      (day) => ![1, 2, 4, 40, 90].includes(day),
    ),
    monumentDays: [2],
    categories: [
      { name: "famous", slug: "famous", count: 2 },
      { name: "France", slug: "france", count: 2 },
    ],
  });
});

test("validate reports days used twice and empty entries", () => {
  assert.deepEqual(validate(projects), []);
  assert.deepEqual(
    validate([...projects, project({ answer: "", days: [2], copyrights: [] })]),
    [
      "days 2: empty answer",
      ": no copyrights entry",
      "day 2 is used twice: Eiffel Tower / Gustave Eiffel / Paris, France and ",
    ],
  );
});

test("the real data.json is valid and every challenge has projects", () => {
  const read = (file: string) =>
    JSON.parse(
      readFileSync(new URL(`../../src/${file}`, import.meta.url), "utf8"),
    );
  const data: Project[] = read("assets/data.json");
  const config = read("config.json");
  const categories = [
    ...config.LISTED_CATEGORIES,
    ...config.LOCKED_CATEGORIES_LOGGED,
  ];

  assert.deepEqual(validate(data), []);

  const index = buildIndex(data, categories);
  for (const { name, slug, count } of index.categories) {
    assert.ok(
      count >= config.ITEMS_PER_LEVEL,
      `${name} has only ${count} projects`,
    );
    assert.ok(/^[a-z0-9-]+$/.test(slug), `${name} has a bad slug`);
  }
  assert.equal(
    new Set(index.categories.map(({ slug }) => slug)).size,
    categories.length,
  );

  for (let day = 0; day <= index.lastDay; day++) {
    assert.equal(!!buildDay(data, day), !index.missingDays.includes(day));
  }
});
