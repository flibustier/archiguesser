import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import "./localStorage.mock.ts";
import { readThemeChoice, resolveTheme } from "../theme.ts";

beforeEach(() => localStorage.clear());

test("the app follows the device unless the player chose", () => {
  assert.equal(resolveTheme("auto", true), "dark");
  assert.equal(resolveTheme("auto", false), "light");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});

test("the choice is read from storage, anything else means the device decides", () => {
  assert.equal(readThemeChoice(), "auto");

  localStorage.setItem("theme", "dark");
  assert.equal(readThemeChoice(), "dark");

  localStorage.setItem("theme", "light");
  assert.equal(readThemeChoice(), "light");

  localStorage.setItem("theme", "purple");
  assert.equal(readThemeChoice(), "auto");
});
