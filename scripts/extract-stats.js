const data1 = require("../data/MONTH-PATH-2022-6.json");
const data2 = require("../data/MONTH-PATH-2022-7.json");

const groupByDay = (data) => {
  const grouped = {};

  Object.keys(data).forEach((key) => {
    const [dayNumber, score] = key.slice("Result ".length).split(" : ");

    grouped[dayNumber] = {
      ...grouped[dayNumber],
      [score]: data[key],
    };
  });

  Object.keys(grouped).forEach((dayNumber) => {
    const allScores = Object.values(grouped[dayNumber]);
    const total = allScores.reduce((sum, score) => sum + score, 0);

    grouped[dayNumber]["total"] = total;
    grouped[dayNumber]["winRate"] =
      Math.round(((total - grouped[dayNumber]["0"]) / total) * 100) / 100;
  });

  return grouped;
};

const mergeDataFiles = (files) =>
  files.reduce((acc, file) => {
    const result = { ...acc };

    Object.keys(file)
      .filter((key) => key.includes("Result"))
      .forEach((key) => {
        result[key] = (result[key] || 0) + file[key];
      });

    return result;
  }, {});

const sortByWinRate = (groupedByDay) =>
  Object.entries(groupedByDay).sort((a, b) => a[1].winRate - b[1].winRate);

const mergedData = mergeDataFiles([data1, data2]);
const groupedByDay = groupByDay(mergedData);

console.log(sortByWinRate(groupedByDay));
