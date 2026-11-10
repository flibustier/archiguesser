// Access to the data files generated at build time (see build/game-data.ts).
// A daily game only downloads its own day; the list of names offered by the
// search field is fetched once, after the first picture is on screen.

import gameIndex from "virtual:game-index";

import type { ChallengeProject, DayProject } from "./types";

export { gameIndex };

const fetchJSON = async <T>(path: string): Promise<T | undefined> => {
  const response = await fetch(path);
  const isJSON = (response.headers.get("content-type") || "").includes("json");
  // a missing file is a 404, or the app's HTML when a server falls back on it
  if (response.status === 404 || (response.ok && !isJSON)) {
    return undefined;
  }
  if (!response.ok) {
    throw new Error(`${response.status} on ${path}`);
  }

  return response.json();
};

export const fetchDay = (day: number) =>
  fetchJSON<DayProject>(`/data/day/${day}.json`);

export const fetchChallenge = (slug: string) =>
  fetchJSON<ChallengeProject[]>(`/data/challenge/${slug}.json`);

let answers: Promise<string[]> | undefined;

export const fetchAnswers = (): Promise<string[]> => {
  answers ??= fetchJSON<string[]>("/data/answers.json")
    .then((list) => list || [])
    .catch((error) => {
      answers = undefined; // try again next time
      throw error;
    });

  return answers;
};

export const findCategory = (slug: string) =>
  gameIndex.categories.find((category) => category.slug === slug);

export const categoryByName = (name: string) =>
  gameIndex.categories.find((category) => category.name === name);
