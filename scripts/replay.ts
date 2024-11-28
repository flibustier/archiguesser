import data from "../src/assets/data.json" with { type: "json" };

import { format } from "prettier";
const formatterConfig = {
  parser: "json",
  extends: ["plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": "warn",
  },
};

if (Deno.args.length < 1) {
  console.log(
    "%cUsage: replay [PREVIOUS DAY NUMBER] ([NEXT DAY NUMBER])",
    "color: red"
  );
}

const [day, desiredNextDay] = Deno.args.map(Number);

const dayData = data.find(({ days }) => days.includes(day));

if (!dayData) {
  console.error(`%cNo data found for day ${day}`, "color: red");
  Deno.exit(1);
}

// Default is the last day (Max of days) + 1
const nextDay =
  desiredNextDay ?? Math.max(0, ...data.flatMap(({ days }) => days)) + 1;

dayData.days.push(nextDay);

await Deno.writeTextFile(
  "src/assets/data.json",
  await format(JSON.stringify(data, null, 2), formatterConfig)
);

await Deno.symlink(`${day}`, `public/${nextDay}`);

try {
  await Deno.stat(`sources/${day}`);

  const convertCommand = new Deno.Command("scripts/convert.sh", {
    args: [day.toString()],
  });
  let { success } = await convertCommand.output();

  if (success) {
    console.log(`%cConverted ${day}`, "color: PowderBlue");
  }

  const addCommand = new Deno.Command("git", {
    args: ["add", "public"],
  });
  ({ success } = await addCommand.output());

  if (success) {
    console.log(`%cGit files added`, "color: PowderBlue");
  }

  const commitCommand = new Deno.Command("git", {
    args: ["c", `feat(data): add day ${nextDay} (${day})`],
  });
  ({ success } = await commitCommand.output());

  if (success) {
    console.log(`%cGit committed`, "color: PowderBlue");
  }
} catch (error) {
  console.warn(error);
}

console.log("%cUpdated :\n" + JSON.stringify(dayData, null, 2), "color: green");

console.log("http://localhost:4000/?day=" + nextDay);
