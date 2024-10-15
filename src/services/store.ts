import { getRealDayNumber } from "./date.ts";

enum ObjectName {
  Challenges = "challenges",
  Stats = "stats",
  Settings = "settings",
  LogIn = "login",
  Feedback = "feedback",
}

const fetchObject = (name: ObjectName) =>
  JSON.parse(localStorage.getItem(name) || "{}");
const fetchArray = (name: ObjectName): unknown[] =>
  JSON.parse(localStorage.getItem(name) || "[]");

export const getStats = () => fetchObject(ObjectName.Stats);
export const getSettings = () => fetchObject(ObjectName.Settings);
export const getChallenges = () => fetchObject(ObjectName.Challenges);

const setObject = (object: ObjectName) => (entry: string, value: any) =>
  localStorage.setItem(
    object,
    JSON.stringify({
      ...fetchObject(object),
      [entry]: value,
    }),
  );

export const setSetting = setObject(ObjectName.Settings);
export const setChallenges = setObject(ObjectName.Challenges);

const overrideObject =
  (object: ObjectName) => (stringifiedValue: string, additionalData?: any) =>
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
  const { firstPlayed, lastPlayed, ...stats } = getStats();

  return (Object.values(stats) as number[]).reduce(
    (total, dailyScore) => total + 1 + ((7 - dailyScore) % 7),
    0,
  );
};
export const getChallengesScore = () => {
  const { dayNumber, retryCount, ...challengeLevels } = getChallenges();

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

export const saveFeedback = (value = "skipped") => {
  const feedback = fetchArray(ObjectName.Feedback);
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
