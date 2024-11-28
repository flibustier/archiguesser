import data from "../src/assets/data.json" with { type: "json" };
import dist from "../src/assets/data.dist.json" with { type: "json" };

import { format } from "prettier";
const formatterConfig = {
  parser: "json",
  extends: ["plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": "warn",
  },
};

if (Deno.args.length > 1) {
  console.log(
    "%cUsage: add ([LINK])",
    "color: red"
  );
}

const link = Deno.args[0] || "";
const nextDay = Math.max(0, ...data.flatMap(({ days }) => days)) + 1;

const dayData = {
  ...dist,
  days: [nextDay],
  links: [link],
};

data.push(dayData);

await Deno.writeTextFile(
  "src/assets/data.json",
  await format(JSON.stringify(data, null, 2), formatterConfig)
);

console.log("%cUpdated :\n" + JSON.stringify(dayData, null, 2), "color: green");

console.log("http://localhost:4000/?day=" + nextDay);
