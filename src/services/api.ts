import type { Stats, Challenges } from "./store.ts";
import { getClientID, getCredentials } from "./store.ts";

export const fetchWikipediaSummary = async (link: string): Promise<string> => {
  if (link.includes("wikipedia.org/wiki/")) {
    const pageTitle = link.slice("https://**.wikipedia.org/wiki/".length);
    const domain = link.slice(0, "https://**.wikipedia.org".length);
    const resp = await fetch(
      `${domain}/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${pageTitle}`,
    );
    if (resp.ok) {
      const {
        query: { pages },
      } = await resp.json();

      for (const page in pages) {
        return pages[page].extract.replace("\n", "<br />");
      }
    }
  }

  return "";
};

const isProduction = import.meta.env.PROD;

export const sendEvent = (event: string) => {
  if (isProduction) {
    try {
      cabin.event(event);
    } catch (e) {
      console.log(e);
    }
  } else {
    console.log("EVENT: ", event);
  }
};

const endpoint = isProduction
  ? "https://stats.archiguesser.com/"
  : "http://localhost:8085/";

const convertStats = (stats: Stats) => {
  const { firstPlayed, lastPlayed, ...dailyStats } = stats;

  return {
    start_day: firstPlayed,
    last_day: lastPlayed,
    stats_days: Object.keys(dailyStats).map((day) => parseInt(day)),
    stats_scores: Object.values(dailyStats),
  };
};

const postData = (resource: string, data: object) =>
  fetch(endpoint + resource, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: getClientID(),
      ...getCredentials(),
      ...data,
    }),
  });

export const sendResult = async (
  dayNumber: number,
  score: number,
  guesses: string[],
  stats: Stats,
): Promise<number | undefined> => {
  try {
    const response = await postData("result", {
      day: dayNumber,
      score,
      guesses,
      ...convertStats(stats),
    });

    if (score === 0) {
      return undefined;
    }

    const successPercent = await response.json();

    return successPercent;
  } catch {
    return undefined;
  }
};

export const sendChallengeResult = async (
  score: number,
  level: number,
  category: string,
  failedOn: string,
  challenges: Challenges,
): Promise<void> => {
  try {
    const { retryCount, dayNumber, ...challengesScores } = challenges;
    await postData("challenge", {
      day: dayNumber,
      score,
      level,
      category,
      failed_on: failedOn,
      retry_count: retryCount,
      challenges: JSON.stringify(challengesScores),
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendFeedback = async (value: string): Promise<void> => {
  try {
    await postData("feedback", {
      value,
    });
  } catch (error) {
    console.error(error);
    sendEvent("feedback: " + value);
  }
};

export interface UserData {
  isCreated?: boolean;
  output?: unknown;
  stats?: string;
  challenges?: string;
  start_day?: number;
  last_day?: number;
}

export const signIn = async (
  email: string,
  password: string,
  stats: Stats,
  challenges: Challenges,
): Promise<UserData> => {
  try {
    const response = await postData("user", {
      email,
      password,
      challenges: JSON.stringify(challenges),
      ...convertStats(stats),
    });

    if (response.status == 200) {
      return response.json();
    } else if (response.status == 201) {
      return {
        isCreated: true,
      };
    } else {
      const output = await response.text();

      return { output };
    }
  } catch (output) {
    return { output };
  }
};
