import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { readStorage, resetStorage } from "./localStorage.mock.ts";
import {
  getChallengesScore,
  getClientID,
  getCredentials,
  getDailiesScore,
  getGuesses,
  getLastFeedback,
  getSavedFeedbacks,
  getScore,
  getSettings,
  isFirstTime,
  isLogged,
  overrideStats,
  saveFeedback,
  setChallenges,
  setGuesses,
  setLogIn,
  setLogOut,
  setSetting,
} from "../store.ts";

beforeEach(() => resetStorage());

test("a daily game is worth 7 points in one guess, 2 in six, 1 when lost", () => {
  resetStorage({
    stats: { firstPlayed: 1, lastPlayed: 5, 1: 1, 2: 6, 3: 0, 4: 3 },
  });

  assert.equal(getDailiesScore(), 7 + 2 + 1 + 5);
});

test("challenge levels are worth 50, then 100, then 150…", () => {
  resetStorage({
    challenges: { dayNumber: 900, retryCount: 2, famous: 1, museum: 3 },
  });

  assert.equal(getChallengesScore(), 50 + (50 + 100 + 150));
});

test("the total adds 50 points for players with an account", () => {
  resetStorage({ stats: { 1: 1 }, challenges: { famous: 1 } });
  assert.equal(getScore(), 57);

  setLogIn("ludwig@mvdr.com", "less:is:more");
  assert.equal(getScore(), 107);
});

test("credentials survive a password containing colons", () => {
  assert.equal(isLogged(), false);
  assert.deepEqual(getCredentials(), { email: "", password: "" });

  setLogIn("ludwig@mvdr.com", "less:is:more");
  assert.equal(isLogged(), true);
  assert.deepEqual(getCredentials(), {
    email: "ludwig@mvdr.com",
    password: "less:is:more",
  });

  setLogOut();
  assert.equal(isLogged(), false);
});

test("each day keeps its own guesses", () => {
  setGuesses(10, ["Villa Savoye"]);
  setGuesses(11, ["", "Fallingwater"]);

  assert.deepEqual(getGuesses(10), ["Villa Savoye"]);
  assert.deepEqual(getGuesses(11), ["", "Fallingwater"]);
  assert.deepEqual(getGuesses(12), []);
});

test("only the 30 most recently played days are kept", () => {
  for (let day = 1; day <= 35; day++) {
    setGuesses(day, [`guess ${day}`]);
  }
  // playing an old day again makes it recent
  setGuesses(6, ["again"]);

  assert.equal(readStorage("games").length, 30);
  assert.deepEqual(getGuesses(5), []);
  assert.deepEqual(getGuesses(6), ["again"]);
  assert.deepEqual(getGuesses(7), ["guess 7"]);
  assert.deepEqual(getGuesses(35), ["guess 35"]);
});

test("the game saved by the previous version is still there", () => {
  resetStorage({ dayNumber: "42", guesses: ["Villa Savoye"] });

  assert.deepEqual(getGuesses(42), ["Villa Savoye"]);
  assert.deepEqual(getGuesses(43), []);

  // starting another day keeps it, in the new format
  setGuesses(43, [""]);
  assert.deepEqual(getGuesses(42), ["Villa Savoye"]);
  assert.deepEqual(getGuesses(43), [""]);
  assert.equal(readStorage("dayNumber"), undefined);
  assert.equal(readStorage("guesses"), undefined);
});

test("stats from the server are merged with the local ones", () => {
  resetStorage({ stats: { firstPlayed: 3, lastPlayed: 4, 3: 2, 4: 0 } });

  overrideStats('{"1":5,"4":1}', { firstPlayed: 1, lastPlayed: 4 });

  assert.deepEqual(readStorage("stats"), {
    firstPlayed: 1,
    lastPlayed: 4,
    1: 5,
    3: 2,
    4: 1,
  });
});

test("settings and challenges are saved entry by entry", () => {
  setSetting("showThumbnail", false);
  setChallenges("famous", 2);
  setChallenges("museum", 1);

  assert.deepEqual(getSettings(), { showThumbnail: false });
  assert.deepEqual(readStorage("challenges"), { famous: 2, museum: 1 });
});

test("a new visitor gets a client id, once", () => {
  assert.equal(isFirstTime(), true);

  const clientID = getClientID();

  assert.ok(clientID.length > 8);
  assert.equal(getClientID(), clientID);
  assert.equal(isFirstTime(), false);
});

test("skipped suggestions are replaced, real ones are kept", () => {
  saveFeedback();
  saveFeedback();
  assert.equal(readStorage("feedback").length, 1);
  assert.equal(getLastFeedback()?.value, "skipped");
  assert.deepEqual(getSavedFeedbacks(), []);

  saveFeedback("Villa Savoye");
  saveFeedback("never");
  assert.deepEqual(getSavedFeedbacks(), ["Villa Savoye"]);
});
