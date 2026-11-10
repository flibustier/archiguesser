// Fills the picture credits of a day prepared with `make propose`:
//
//   make credits DAY=1600
//
// The six pictures chosen in sources/<day>/ (renamed 1 to 6) are recognised by
// their content in credits.json, whatever their new name.

import { encodeHex } from "jsr:@std/encoding@1/hex";
import { format } from "prettier";

const day = Number(Deno.args[0]);
const dataFile = Deno.args[1] || "src/assets/data.json";
const directory = `${Deno.args[2] || "sources"}/${day}`;
if (!Number.isInteger(day)) {
  console.log("%cUsage: credits <DAY>", "color: red");
  Deno.exit(1);
}

const known: Record<string, { credit: string; license: string; page: string }> =
  JSON.parse(await Deno.readTextFile(`${directory}/credits.json`));
const data = JSON.parse(await Deno.readTextFile(dataFile));
const project = data.find(({ days }: { days: number[] }) => days.includes(day));
if (!project) {
  console.error(`%cDay ${day} is not in data.json`, "color: red");
  Deno.exit(1);
}

const copyrights: Record<string, string> = {};
const missing: number[] = [];
for (let picture = 1; picture <= 6; picture++) {
  let file: string | undefined;
  for await (const entry of Deno.readDir(directory)) {
    if (entry.isFile && entry.name.replace(/\.[^.]+$/, "") === String(picture)) {
      file = entry.name;
    }
  }
  const bytes = file ? await Deno.readFile(`${directory}/${file}`) : undefined;
  const source = bytes && known[encodeHex(await crypto.subtle.digest("SHA-256", bytes))];
  if (source) {
    copyrights[picture] = source.credit;
    console.log(`  ${picture}  ${source.credit}  [${source.license}]  ${source.page}`);
  } else {
    copyrights[picture] = "";
    missing.push(picture);
    console.log(`  ${picture}  ${file ? "not from `make propose`: credit it by hand" : "no picture yet"}`);
  }
}

const index = project.days.indexOf(day);
while (project.copyrights.length <= index) {
  project.copyrights.push({});
}
project.copyrights[index] = copyrights;

await Deno.writeTextFile(
  dataFile,
  await format(JSON.stringify(data, null, 2), { parser: "json" }),
);
console.log(
  missing.length
    ? `%cCredits written, except for picture ${missing.join(", ")}`
    : "%cCredits written for the six pictures",
  missing.length ? "color: orange" : "color: green",
);
