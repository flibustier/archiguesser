export const getStats = () => JSON.parse(localStorage.getItem("stats") || "{}");

export const getNumberOfDayPlayed = () => Object.keys(getStats()).length;
