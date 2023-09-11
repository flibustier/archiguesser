const fetchObject = (name: string) =>
  JSON.parse(localStorage.getItem(name) || "{}");

export const getStats = () => fetchObject("stats");
export const getSettings = () => fetchObject("settings");
export const getChallenges = () => fetchObject("challenges");

const setObject = (object: string) => (entry: string, value: any) =>
  localStorage.setItem(
    object,
    JSON.stringify({
      ...fetchObject(object),
      [entry]: value,
    }),
  );

export const setSetting = setObject("settings");
export const setChallenges = setObject("challenges");

export const getNumberOfDayPlayed = () => Object.keys(getStats()).length;

export const setLogIn = (email: string, password: string) =>
  localStorage.setItem("login", btoa(email + ":" + password));
export const setLogOut = () => localStorage.removeItem("login");

export const getCredentials = () => {
  const info = localStorage.getItem("login");
  if (info) {
    const credentials = atob(info);
    const email = credentials.substring(0, credentials.indexOf(":"));
    const password = credentials.substring(credentials.indexOf(":") + 1);

    return { email, password };
  }

  return { email: "", password: "" };
};
export const isLogged = () => localStorage.getItem("login") != null;

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
