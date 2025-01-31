import { getRealDayNumber } from "./date.ts";

export type Challenges = Record<string, number>;
export type Settings = Record<string, boolean>;
export interface Stats {
  firstPlayed: number;
  lastPlayed: number;
  [day: string]: number;
}

enum ObjectName {
  Challenges = "challenges",
  Stats = "stats",
  Settings = "settings",
  LogIn = "login",
  Feedback = "feedback",
  ClientID = "clientID",
}

const fetchObject = (name: ObjectName) =>
  JSON.parse(localStorage.getItem(name) || "{}");
const fetchArray = <T>(name: ObjectName): T[] =>
  JSON.parse(localStorage.getItem(name) || "[]");

export const getStats = (): Stats => fetchObject(ObjectName.Stats);
export const getSettings = (): Settings => fetchObject(ObjectName.Settings);
export const getChallenges = (): Challenges =>
  fetchObject(ObjectName.Challenges);

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
