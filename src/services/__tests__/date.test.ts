import { test } from "node:test";
import assert from "node:assert/strict";

import { getDayNumber, getRealDayNumber } from "../date.ts";

test("day 0 is the 1st of July 2022", () => {
  assert.equal(getDayNumber(new Date(2022, 6, 1)), 0);
  assert.equal(getDayNumber(new Date(2022, 6, 2)), 1);
});

test("the day does not depend on the time of the day", () => {
  assert.equal(getDayNumber(new Date(2022, 6, 11, 0, 0, 1)), 10);
  assert.equal(getDayNumber(new Date(2022, 6, 11, 23, 59, 59)), 10);
});

test("day numbers are whole across daylight saving changes", () => {
  // last Sunday of March and October: 23 h and 25 h days in Europe
  assert.equal(getDayNumber(new Date(2026, 2, 30)), 1368);
  assert.equal(getDayNumber(new Date(2026, 9, 26)), 1578);
  assert.equal(getDayNumber(new Date(2026, 10, 9)), 1592);
});

test("today is a whole number of days", () => {
  assert.ok(Number.isInteger(getRealDayNumber()));
  assert.ok(getRealDayNumber() >= 1592);
});
