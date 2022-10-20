const fetchObject = (name: string) =>
  JSON.parse(localStorage.getItem(name) || "{}");

export const getStats = () => fetchObject("stats");
export const getSettings = () => fetchObject("settings");

export const setSetting = (name: string, value: boolean) =>
  localStorage.setItem(
    "settings",
    JSON.stringify({
      ...fetchObject("settings"),
      [name]: value,
    })
  );

export const getNumberOfDayPlayed = () => Object.keys(getStats()).length;
