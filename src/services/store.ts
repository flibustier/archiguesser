import { getRealDayNumber } from "./date.ts";

export type Challenges = Record<string, number>;
export type Settings = Record<string, boolean>;
export interface Stats {
  firstPlayed: number;
  lastPlayed: number;
  [day: string]: number;
}
export interface FeedbackFormData {
  email: string;
  want_credit: boolean;
  credit_name: string;
}

// A plain object rather than an enum: unit tests run this file with Node,
// which strips types but does not compile enums.
const ObjectName = {
  Challenges: "challenges",
  Stats: "stats",
  Settings: "settings",
  LogIn: "login",
  Feedback: "feedback",
  ClientID: "clientID",
  FeedbackForm: "feedbackForm",
  Games: "games",
} as const;
type ObjectName = (typeof ObjectName)[keyof typeof ObjectName];

const fetchObject = (name: ObjectName) =>
  JSON.parse(localStorage.getItem(name) || "{}");
const fetchArray = <T>(name: ObjectName): T[] =>
  JSON.parse(localStorage.getItem(name) || "[]");

interface Game {
  day: number;
  guesses: string[];
}
// Each day keeps its own guesses, so that opening another day does not wipe a
// game in progress. Only the most recently played days are kept.
const MAX_SAVED_GAMES = 30;
// Before "games", a single game was saved under these two keys
const LEGACY_DAY = "dayNumber";
const LEGACY_GUESSES = "guesses";

export const getGuesses = (day: number): string[] => {
  const game = fetchArray<Game>(ObjectName.Games).find(
    (game) => game.day === day,
  );
  if (game) {
    return game.guesses;
  }
  if (localStorage.getItem(LEGACY_DAY) === day.toString()) {
    return JSON.parse(localStorage.getItem(LEGACY_GUESSES) || "[]");
  }

  return [];
};

export const setGuesses = (day: number, guesses: string[]) => {
  const otherGames = fetchArray<Game>(ObjectName.Games).filter(
    (game) => game.day !== day,
  );
  const legacyDay = localStorage.getItem(LEGACY_DAY);
  if (legacyDay !== null) {
    // move the game saved by the previous version along with the others
    if (
      legacyDay !== day.toString() &&
      !otherGames.some((game) => game.day === parseInt(legacyDay))
    ) {
      otherGames.push({
        day: parseInt(legacyDay),
        guesses: JSON.parse(localStorage.getItem(LEGACY_GUESSES) || "[]"),
      });
    }
    localStorage.removeItem(LEGACY_DAY);
    localStorage.removeItem(LEGACY_GUESSES);
  }

  localStorage.setItem(
    ObjectName.Games,
    JSON.stringify([...otherGames, { day, guesses }].slice(-MAX_SAVED_GAMES)),
  );
};

export const getStats = (): Stats => fetchObject(ObjectName.Stats);
export const getSettings = (): Settings => fetchObject(ObjectName.Settings);
export const getChallenges = (): Challenges =>
  fetchObject(ObjectName.Challenges);

export const getFeedbackFormRecurringData = (): FeedbackFormData =>
  ({
    email: "",
    want_credit: false,
    credit_name: "",
    ...fetchObject(ObjectName.FeedbackForm),
  }) as FeedbackFormData;

const setObject =
  <T>(object: ObjectName) =>
  (entry: string, value: T) =>
    localStorage.setItem(
      object,
      JSON.stringify({
        ...fetchObject(object),
        [entry]: value,
      }),
    );

export const setSetting = setObject<Settings>(ObjectName.Settings);
export const setChallenges = setObject<Challenges>(ObjectName.Challenges);

export const setFeedbackFormRecurringData = (
  feedbackForm: FeedbackFormData,
) => {
  localStorage.setItem(
    ObjectName.FeedbackForm,
    JSON.stringify({
      email: feedbackForm.email,
      want_credit: feedbackForm.want_credit,
      credit_name: feedbackForm.credit_name,
    }),
  );
};

const overrideObject =
  (object: ObjectName) =>
  (
    stringifiedValue: string,
    additionalData?: Record<string, number | undefined>,
  ) =>
    localStorage.setItem(
      object,
      JSON.stringify({
        ...fetchObject(object),
        ...JSON.parse(stringifiedValue),
        ...additionalData,
      }),
    );
export const overrideStats = overrideObject(ObjectName.Stats);
export const overrideChallenges = overrideObject(ObjectName.Challenges);

export const getNumberOfDayPlayed = () => Object.keys(getStats()).length;

export const setLogIn = (email: string, password: string) =>
  localStorage.setItem(ObjectName.LogIn, btoa(email + ":" + password));
export const setLogOut = () => localStorage.removeItem(ObjectName.LogIn);

interface Credentials {
  email: string;
  password: string;
}
export const getCredentials = (): Credentials => {
  const info = localStorage.getItem(ObjectName.LogIn);
  if (info) {
    const credentials = atob(info);
    const email = credentials.substring(0, credentials.indexOf(":"));
    const password = credentials.substring(credentials.indexOf(":") + 1);

    return { email, password };
  }

  return { email: "", password: "" };
};
export const isLogged = () => localStorage.getItem(ObjectName.LogIn) != null;

export const getDailiesScore = () => {
  const {
    firstPlayed: _firstPlayed,
    lastPlayed: _lastPlayed,
    ...stats
  } = getStats();

  return (Object.values(stats) as number[]).reduce(
    (total, dailyScore) => total + 1 + ((7 - dailyScore) % 7),
    0,
  );
};
export const getChallengesScore = () => {
  const {
    dayNumber: _dayNumber,
    retryCount: _retryCount,
    ...challengeLevels
  } = getChallenges();

  return (Object.values(challengeLevels) as number[]).reduce(
    (total, challengeLevel) => {
      let challengeScore = 0;
      for (let i = 1; i <= challengeLevel; i++) {
        challengeScore += i * 50;
      }
      return total + challengeScore;
    },
    0,
  );
};
export const getScore = () =>
  getDailiesScore() + getChallengesScore() + (isLogged() ? 50 : 0);

interface Feedback {
  day: number;
  value: string;
}

export const getSavedFeedbacks = () => {
  const feedbacks = fetchArray<Feedback>(ObjectName.Feedback);

  return feedbacks
    .map(({ value }) => value)
    .filter((value) => !["skipped", "never"].includes(value));
};

export const saveFeedback = (value = "skipped") => {
  const feedback = fetchArray<Feedback>(ObjectName.Feedback).filter(
    ({ value }) => value !== "skipped",
  );
  feedback.push({
    day: getRealDayNumber(),
    value,
  });

  localStorage.setItem(ObjectName.Feedback, JSON.stringify(feedback));
};

export const getLastFeedback = () => {
  return (fetchArray(ObjectName.Feedback) as Feedback[])
    .sort((a: Feedback, b: Feedback) => a.day - b.day)
    .pop();
};

export const getClientID = () => {
  let clientID = localStorage.getItem(ObjectName.ClientID);
  if (clientID) {
    return clientID;
  }

  try {
    clientID = crypto.randomUUID();
  } catch {
    clientID = Math.random().toString(16).substring(2, 15);
  }
  localStorage.setItem(ObjectName.ClientID, clientID);

  return clientID;
};

export const setFirstTime = getClientID;

export const isFirstTime = (): boolean => {
  return getScore() === 0 && !localStorage.getItem(ObjectName.ClientID);
};
