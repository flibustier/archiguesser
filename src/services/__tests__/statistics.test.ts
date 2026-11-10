import { test } from "node:test";
import assert from "node:assert/strict";

import { computeStatistics } from "../statistics.ts";

test("no game played yet", () => {
  assert.deepEqual(computeStatistics({}, 100), {
    played: 0,
    won: 0,
    winRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0, 0],
  });
});

test("counts games, wins and the distribution of guesses", () => {
  const statistics = computeStatistics(
    { firstPlayed: 1, lastPlayed: 6, 1: 1, 2: 3, 3: 3, 4: 0, 5: 6, 6: 0 },
    100,
  );

  assert.equal(statistics.played, 6);
  assert.equal(statistics.won, 4);
  assert.equal(statistics.winRate, 67);
  assert.deepEqual(statistics.distribution, [1, 0, 2, 0, 0, 1, 2]);
});

test("a streak is a run of consecutive days won", () => {
  // 1-2-3 won, 4 lost, 5-6 won, 7 not played, 9-10 won
  const stats = { 1: 2, 2: 2, 3: 1, 4: 0, 5: 4, 6: 4, 9: 1, 10: 3 };

  assert.equal(computeStatistics(stats, 10).bestStreak, 3);
  assert.equal(computeStatistics(stats, 10).currentStreak, 2);
});

test("the current streak survives until the end of the next day", () => {
  const stats = { 9: 1, 10: 3 };

  assert.equal(computeStatistics(stats, 10).currentStreak, 2); // played today
  assert.equal(computeStatistics(stats, 11).currentStreak, 2); // today still to play
  assert.equal(computeStatistics(stats, 12).currentStreak, 0); // a day was missed
});

test("a loss ends the current streak", () => {
  assert.equal(computeStatistics({ 8: 1, 9: 1, 10: 0 }, 10).currentStreak, 0);
  assert.equal(computeStatistics({ 8: 1, 9: 1, 10: 0 }, 10).bestStreak, 2);
});

test("replaying old days does not extend the current streak", () => {
  assert.equal(computeStatistics({ 3: 1, 4: 1, 10: 2 }, 10).currentStreak, 1);
});
