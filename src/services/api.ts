import { getCredentials } from "./store";

export const sendEvent = (event: string) => {
  if (process.env.NODE_ENV === "production") {
    try {
      cabin.event(event);
    } catch (e) {
      console.log(e);
    }
  }
};

const endpoint =
  process.env.NODE_ENV === "production"
    ? "https://stats.archiguesser.com/"
    : "http://localhost:8080/";

interface StatsObject {
  firstPlayed: number;
  lastPlayed: number;
}

const convertStats = (stats: StatsObject) => {
  const { firstPlayed, lastPlayed, ...dailyStats } = stats;

  return {
    start_day: firstPlayed,
    last_day: lastPlayed,
    stats_days: Object.keys(dailyStats).map((day) => parseInt(day)),
    stats_scores: Object.values(dailyStats),
  };
};

export const sendResult = async (
  dayNumber: number,
  score: number,
  guesses: string[],
  stats: StatsObject,
): Promise<number | undefined> => {
  try {
    const response = await fetch(endpoint + "result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        day: dayNumber,
        score,
        guesses,
        ...convertStats(stats),
        ...getCredentials(),
      }),
    });

    if (score === 0) {
      return undefined;
    }

    const successPercent = await response.json();

    return successPercent;
  } catch (error) {
    return undefined;
  }
};

export const sendChallengeResult = async (
  score: number,
  level: number,
  category: string,
  failedOn: string,
  challenges: any,
): Promise<void> => {
  try {
    const { retryCount, dayNumber, ...challengesScores } = challenges;
    await fetch(endpoint + "challenge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        day: dayNumber,
        score,
        level,
        category,
        failed_on: failedOn,
        retry_count: retryCount,
        challenges: JSON.stringify(challengesScores),
        ...getCredentials(),
      }),
    });
  } catch (error) {
    console.log(error);
  }
};

export const signIn = async (
  email: string,
  password: string,
  stats: StatsObject,
  challenges: any,
): Promise<any> => {
  try {
    const response = await fetch(endpoint + "user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        challenges: JSON.stringify(challenges),
        ...convertStats(stats),
      }),
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

export const fetchWikipediaSummary = async (link: string): Promise<string> => {
  if (link.includes("https://en.wikipedia.org/wiki/")) {
    const pageTitle = link.slice("https://en.wikipedia.org/wiki/".length);
    const resp = await fetch(
      `https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${pageTitle}`,
    );
    if (resp.ok) {
      const {
        query: { pages },
      } = await resp.json();

      for (const page in pages) {
        return pages[page].extract;
      }
    }
  }

  return "";
};
