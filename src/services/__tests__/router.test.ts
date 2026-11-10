import { test } from "node:test";
import assert from "node:assert/strict";

import {
  challengePath,
  dayPath,
  legacyRedirect,
  matchRoute,
} from "../../router.ts";

const url = (pathname: string, search = "", hash = "") => ({
  pathname,
  search,
  hash,
});

test("matchRoute recognises every page", () => {
  assert.deepEqual(matchRoute("/"), { name: "daily", path: "/", params: {} });
  assert.equal(matchRoute("/replay")?.name, "replay");
  assert.equal(matchRoute("/challenges")?.name, "challenges");
  assert.equal(matchRoute("/score")?.name, "score");
  assert.equal(matchRoute("/account")?.name, "account");
  assert.equal(matchRoute("/about")?.name, "about");
});

test("matchRoute reads parameters", () => {
  assert.deepEqual(matchRoute("/day/1592"), {
    name: "day",
    path: "/day/1592",
    params: { day: "1592" },
  });
  assert.deepEqual(matchRoute("/challenge/le-corbusier")?.params, {
    category: "le-corbusier",
  });
});

test("matchRoute tolerates trailing slashes and .html", () => {
  assert.equal(matchRoute("/replay/")?.name, "replay");
  assert.equal(matchRoute("/replay.html")?.name, "replay");
  assert.equal(matchRoute("/day/12/")?.params.day, "12");
  assert.equal(matchRoute("/day/12.html")?.params.day, "12");
});

test("matchRoute rejects unknown URLs", () => {
  assert.equal(matchRoute("/nope"), undefined);
  assert.equal(matchRoute("/day"), undefined);
  assert.equal(matchRoute("/day/"), undefined);
  assert.equal(matchRoute("/day/1/2"), undefined);
  assert.equal(matchRoute("/1500/1.jpg"), undefined);
  assert.equal(matchRoute("/day/%E0%A4%A"), undefined);
});

test("links shared before the router still work", () => {
  assert.equal(legacyRedirect(url("/", "?day=123")), "/day/123");
  assert.equal(legacyRedirect(url("/", "?day=0")), "/day/0");
  assert.equal(
    legacyRedirect(url("/", "?challenge=famous")),
    "/challenge/famous",
  );
  assert.equal(
    legacyRedirect(
      url("/", "?challenge=United%20States%20of%20America%20(USA)"),
    ),
    "/challenge/united-states-of-america-usa",
  );
  assert.equal(legacyRedirect(url("/", "", "#replay")), "/replay");
  assert.equal(legacyRedirect(url("/", "", "#challenges")), "/challenges");
  assert.equal(legacyRedirect(url("/", "", "#score")), "/score");
  assert.equal(legacyRedirect(url("/", "", "#info")), "/about");
  assert.equal(legacyRedirect(url("/", "", "#login")), "/account");
});

test("nothing to redirect on normal URLs", () => {
  assert.equal(legacyRedirect(url("/")), undefined);
  assert.equal(legacyRedirect(url("/", "?day=abc")), undefined);
  assert.equal(legacyRedirect(url("/", "?utm_source=x")), undefined);
  assert.equal(legacyRedirect(url("/replay", "?day=3")), undefined);
});

test("paths are built the way they are read", () => {
  assert.equal(matchRoute(dayPath(42))?.params.day, "42");
  assert.equal(
    challengePath("United Kingdom (UK)"),
    "/challenge/united-kingdom-uk",
  );
  assert.equal(
    matchRoute(challengePath("concert hall"))?.params.category,
    "concert-hall",
  );
});
