import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { readStorage, resetStorage } from "./localStorage.mock.ts";
import {
  flushPendingResults,
  getPendingResults,
  keepForLater,
} from "../outbox.ts";

beforeEach(() => resetStorage());

const result = (day: number, score = 1) => ({ day, score, guesses: ["x"] });

test("results wait in order, one per day", () => {
  keepForLater(result(10));
  keepForLater(result(11));
  keepForLater(result(10, 3));

  assert.deepEqual(getPendingResults(), [result(11), result(10, 3)]);
});

test("everything is sent once the server answers", async () => {
  keepForLater(result(10));
  keepForLater(result(11));
  const received: number[] = [];

  const sent = await flushPendingResults(async ({ day }) => {
    received.push(day);
    return true;
  });

  assert.equal(sent, 2);
  assert.deepEqual(received, [10, 11]);
  assert.deepEqual(getPendingResults(), []);
  assert.equal(readStorage("pendingResults"), undefined);
});

test("what could not be sent stays for next time", async () => {
  keepForLater(result(10));
  keepForLater(result(11));
  keepForLater(result(12));

  const sent = await flushPendingResults(async ({ day }) => day === 10);

  assert.equal(sent, 1);
  assert.deepEqual(getPendingResults(), [result(11), result(12)]);
});

test("corrupted storage is ignored", async () => {
  resetStorage({ pendingResults: "not json" });
  assert.deepEqual(getPendingResults(), []);

  resetStorage({ pendingResults: { not: "a list" } });
  assert.deepEqual(getPendingResults(), []);
  assert.equal(await flushPendingResults(async () => true), 0);
});

test("only the 30 most recent results are kept", () => {
  for (let day = 1; day <= 40; day++) {
    keepForLater(result(day));
  }

  assert.equal(getPendingResults().length, 30);
  assert.equal(getPendingResults()[0].day, 11);
});
