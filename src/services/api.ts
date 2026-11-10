import type { Stats, Challenges } from "./store.ts";
import { getClientID, getCredentials, getStats } from "./store.ts";
import { flushPendingResults, keepForLater } from "./outbox.ts";

// Introduction of a Wikipedia article, as plain text ("" when unavailable)
export const fetchWikipediaSummary = async (link: string): Promise<string> => {
  const [, domain, pageTitle] =
    link.match(/^(https:\/\/[a-z-]+\.wikipedia\.org)\/wiki\/([^?#]+)/) || [];
  if (!domain) {
    return "";
  }

  try {
    const resp = await fetch(
      `${domain}/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${pageTitle}`,
    );
    if (resp.ok) {
      const {
        query: { pages },
      } = await resp.json();

      for (const page in pages) {
        return pages[page].extract || "";
      }
    }
  } catch {
    // the description is a bonus: never break the end of a game for it
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

// Page views after the first one (navigation without reload). GoatCounter
// needs to be told; it is absent in development and when blocked.
export const sendPageView = (path: string) => {
  if (isProduction) {
    try {
      window.goatcounter?.count?.({ path });
    } catch (e) {
      console.log(e);
    }
  } else {
    console.log("PAGE VIEW: ", path);
  }
};

// A few rare events worth following over time (installations of the app).
// Unlike sendEvent, the names are fixed, so GoatCounter can count them too.
export const sendMilestone = (name: "app-installed" | "app-opened") => {
  sendEvent(name);
  if (isProduction) {
    try {
      window.goatcounter?.count?.({ path: name, title: name, event: true });
    } catch (e) {
      console.log(e);
    }
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
  let response: Response;
  try {
    response = await postData("result", {
      day: dayNumber,
      score,
      guesses,
      ...convertStats(stats),
    });
  } catch {
    // offline, or the server cannot be reached: sent again later
    keepForLater({ day: dayNumber, score, guesses });

    return undefined;
  }

  try {
    return score === 0 ? undefined : await response.json();
  } catch {
    return undefined;
  }
};

// Results played offline are sent when the app starts or is back online
export const sendPendingResults = () =>
  flushPendingResults(async ({ day, score, guesses }) => {
    try {
      await postData("result", {
        day,
        score,
        guesses,
        ...convertStats(getStats()),
      });

      return true;
    } catch {
      return false;
    }
  });

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

interface Feedback {
  link: string;
  email: string;
  project: string;
  is_involved: boolean;
  want_credit: boolean;
  credit_name: string;
}

export const sendFeedback = async (feedback: Feedback): Promise<void> => {
  try {
    await postData("feedback", feedback);
  } catch (error) {
    console.error(error);
    sendEvent("feedback: " + feedback.project);
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

// Asks for an email with a link to choose a new password. The server answers
// the same thing whether the account exists or not.
export const requestPasswordReset = async (
  email: string,
): Promise<"sent" | "unavailable" | "unreachable"> => {
  try {
    const response = await postData("password/forgot", { email });

    return response.ok ? "sent" : "unavailable";
  } catch {
    return "unreachable";
  }
};

// Sets the new password with the token received by email. Answers the email
// of the account, or the reason why it did not work.
export const resetPassword = async (
  token: string,
  password: string,
): Promise<{ email?: string; error?: string }> => {
  try {
    const response = await postData("password/reset", { token, password });
    if (response.ok) {
      return { email: await response.json() };
    }

    return {
      error:
        response.status === 400
          ? await response.text()
          : "Something went wrong, please try again later.",
    };
  } catch {
    return {
      error: "The server could not be reached, please try again later.",
    };
  }
};

export const deleteAccount = async (
  email: string,
  password: string,
): Promise<boolean> => {
  try {
    return (await postData("user/delete", { email, password })).ok;
  } catch {
    return false;
  }
};
