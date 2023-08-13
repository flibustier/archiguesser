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
