// Prepares a new day from a Wikidata item or a Wikipedia article:
//
//   make propose Q=Q915603            (or Q=https://en.wikipedia.org/wiki/…)
//
// 1. reads the name, architects, place and dates on Wikidata
// 2. adds the entry to data.json for the next free day
// 3. downloads the best free pictures of its Wikimedia Commons category in
//    sources/<day>/, with their author and licence in credits.json
//
// Then choose six pictures, rename them 1 to 6, and run `make credits DAY=<day>`
// followed by `make convert DAY=<day>`.

import { parseArgs } from "jsr:@std/cli@1/parse-args";
import { encodeHex } from "jsr:@std/encoding@1/hex";
import { format } from "prettier";

import {
  buildAnswer,
  buildYears,
  type CommonsFile,
  credit,
  type Facts,
  guessCategories,
  nameKey,
  parseTarget,
  rankFiles,
} from "./propose/lib.ts";

type Json = Record<string, any>;

const USER_AGENT =
  "ArchiGuesser/1.0 (https://archiguesser.com; contact@archiguesser.com)";

const args = parseArgs(Deno.args, {
  string: ["day", "credits", "pictures", "data", "sources"],
  boolean: ["dry-run", "force"],
  default: {
    pictures: "12",
    data: "src/assets/data.json",
    sources: "sources",
  },
});
const target = parseTarget(String(args._[0] || ""));
if (!target) {
  console.log(
    "%cUsage: propose <Wikidata id or Wikipedia address> [--day N] [--credits NAME] [--pictures 12] [--dry-run]",
    "color: red",
  );
  Deno.exit(1);
}

const api = async (
  host: string,
  params: Record<string, string>,
): Promise<Json> => {
  const query = new URLSearchParams({
    format: "json",
    formatversion: "2",
    ...params,
  });
  const response = await fetch(`https://${host}/w/api.php?${query}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`${response.status} from ${host}`);
  }

  return response.json();
};

const claims = (entity: Json, property: string): any[] =>
  (entity.claims?.[property] || [])
    .filter((claim: Json) => claim.rank !== "deprecated")
    .map((claim: Json) => claim.mainsnak?.datavalue?.value)
    .filter((value: unknown) => value !== undefined);
const ids = (entity: Json, property: string): string[] =>
  claims(entity, property)
    .map((value) => value?.id)
    .filter(Boolean);
const yearOf = (entity: Json, property: string): number | undefined => {
  const match = claims(entity, property)
    .find((value) => value?.time)
    ?.time?.match(/^([+-])0*(\d+)-/);

  return match ? Number(match[2]) * (match[1] === "-" ? -1 : 1) : undefined;
};
const labelOf = (entity: Json | undefined): string =>
  entity?.labels?.en?.value ||
  entity?.labels?.mul?.value ||
  Object.values<Json>(entity?.labels || {})[0]?.value ||
  "";

// --- 1. Wikidata -----------------------------------------------------------

let qid: string;
if ("qid" in target) {
  qid = target.qid;
} else {
  const json = await api(`${target.lang}.wikipedia.org`, {
    action: "query",
    prop: "pageprops",
    ppprop: "wikibase_item",
    redirects: "1",
    titles: target.title,
  });
  qid = json.query?.pages?.[0]?.pageprops?.wikibase_item;
  if (!qid) {
    console.error(`%cNo Wikidata item for “${target.title}”`, "color: red");
    Deno.exit(1);
  }
}

const entity = (
  await api("www.wikidata.org", {
    action: "wbgetentities",
    ids: qid,
    props: "labels|claims|sitelinks",
  })
).entities?.[qid];
if (!entity || "missing" in entity) {
  console.error(`%c${qid} does not exist on Wikidata`, "color: red");
  Deno.exit(1);
}

const referenced = ["P84", "P131", "P17", "P31", "P149"].flatMap((property) =>
  ids(entity, property),
);
const names: Json = referenced.length
  ? (
      await api("www.wikidata.org", {
        action: "wbgetentities",
        ids: [...new Set(referenced)].slice(0, 50).join("|"),
        props: "labels",
        languages: "en|mul",
      })
    ).entities
  : {};
const labels = (property: string) =>
  ids(entity, property)
    .map((id) => labelOf(names[id]))
    .filter(Boolean);

const wikipediaTitle = entity.sitelinks?.enwiki?.title;
const facts: Facts = {
  label: labelOf(entity),
  architects: labels("P84"),
  city: labels("P131")[0],
  country: labels("P17")[0],
  inception: yearOf(entity, "P571"),
  opening: yearOf(entity, "P1619") ?? yearOf(entity, "P729"),
  wikipedia: wikipediaTitle
    ? `https://en.wikipedia.org/wiki/${encodeURIComponent(wikipediaTitle.replace(/ /g, "_"))}`
    : "qid" in target
      ? undefined
      : String(args._[0]),
  instanceOf: labels("P31"),
  styles: labels("P149"),
};

// --- 2. data.json ----------------------------------------------------------

const data: Json[] = JSON.parse(await Deno.readTextFile(args.data));
const knownCountries = [
  ...new Set(data.map(({ answer }) => answer.split(", ").pop() as string)),
];
const answer = buildAnswer(facts, knownCountries);
const day = args.day
  ? Number(args.day)
  : Math.max(0, ...data.flatMap(({ days }) => days)) + 1;

const twin = data.find(
  (project) => nameKey(project.answer) === nameKey(answer),
);
if (twin && !args.force) {
  console.error(
    `%cAlready in data.json (days ${twin.days.join(", ")}): ${twin.answer}\n` +
      `Use \`make replay DAY=${twin.days[0]}\` to play it again, or --force.`,
    "color: red",
  );
  Deno.exit(1);
}
if (data.some(({ days }) => days.includes(day))) {
  console.error(`%cDay ${day} is already taken`, "color: red");
  Deno.exit(1);
}

const categories = guessCategories(facts);
const entry: Json = {
  answer,
  days: [day],
  copyrights: [
    { "*": "", "1": "", "2": "", "3": "", "4": "", "5": "", "6": "" },
  ],
  years: buildYears(facts),
  links: facts.wikipedia ? [facts.wikipedia] : [],
  categories: args.credits ? ["community", ...categories] : categories,
  ...(args.credits ? { credits: args.credits } : {}),
};

// --- 3. Wikimedia Commons --------------------------------------------------

const category: string | undefined = claims(entity, "P373").find(
  (value) => typeof value === "string",
);
let files: CommonsFile[] = [];
if (category) {
  // the category itself, and its direct sub-categories ("Interior of…",
  // "Exterior of…"), where the best pictures often are
  const members = async (
    title: string,
    type: "file" | "subcat",
    limit: number,
  ) =>
    (
      (
        await api("commons.wikimedia.org", {
          action: "query",
          list: "categorymembers",
          cmtitle: title,
          cmtype: type,
          cmlimit: String(limit),
        })
      ).query?.categorymembers || []
    ).map(({ title }: Json) => title as string);

  const root = `Category:${category}`;
  const subCategories = (await members(root, "subcat", 12)).filter(
    (title: string) =>
      !/\b(in art|maps?|logos?|plans?|drawings?|people|events?|videos?|documents?|collections?|exhibitions?|exhibits?|objects|artworks|works|paintings|sculptures)\b/i.test(
        title,
      ),
  );
  const titles: string[] = [
    ...new Set(
      (
        await Promise.all([
          members(root, "file", 300),
          ...subCategories.map((title: string) => members(title, "file", 100)),
        ])
      ).flat(),
    ),
  ];
  for (let i = 0; i < titles.length; i += 50) {
    const info = await api("commons.wikimedia.org", {
      action: "query",
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: "2400",
      iiextmetadatafilter: "LicenseShortName|Artist|Assessments",
      titles: titles.slice(i, i + 50).join("|"),
    });
    for (const page of info.query?.pages || []) {
      const image = page.imageinfo?.[0];
      if (image) {
        files.push({
          title: page.title,
          url: image.thumburl || image.url,
          page: image.descriptionurl,
          width: image.width,
          height: image.height,
          mime: image.mime,
          license: image.extmetadata?.LicenseShortName?.value || "",
          author: image.extmetadata?.Artist?.value || "",
          assessments: image.extmetadata?.Assessments?.value || "",
        });
      }
    }
  }
}
const found = files.length;
files = rankFiles(files).slice(0, Number(args.pictures));

// --- report, then write ----------------------------------------------------

console.log(`%c${qid} → day ${day}`, "color: green");
console.log(JSON.stringify(entry, null, 2));
console.log(
  category
    ? `\nCommons category “${category}”: ${found} files, ${files.length} kept (free licence, large enough)`
    : "\nNo Commons category: find the pictures yourself (make download URL=… DAY=…)",
);
for (const [index, file] of files.entries()) {
  console.log(
    `  w${String(index + 1).padStart(2, "0")}  ${file.width}x${file.height}  ${file.license.padEnd(12)}  ${credit(file)}`,
  );
}
if (!facts.architects.length) {
  console.log(
    "%cNo architect on Wikidata: complete the answer by hand.",
    "color: orange",
  );
}

if (args["dry-run"]) {
  console.log("\n(dry run: nothing written)");
  Deno.exit(0);
}

const directory = `${args.sources}/${day}`;
await Deno.mkdir(directory, { recursive: true });
const credits: Json = {};
for (const [index, file] of files.entries()) {
  const response = await fetch(file.url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) {
    console.warn(`  could not download ${file.title} (${response.status})`);
    await response.body?.cancel();
    continue;
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const name = `w${String(index + 1).padStart(2, "0")}.${file.mime === "image/png" ? "png" : "jpg"}`;
  await Deno.writeFile(`${directory}/${name}`, bytes);
  // pictures get renamed 1 to 6: their content, not their name, identifies them
  credits[encodeHex(await crypto.subtle.digest("SHA-256", bytes))] = {
    file: name,
    credit: credit(file),
    license: file.license,
    page: file.page,
  };
}
await Deno.writeTextFile(
  `${directory}/credits.json`,
  JSON.stringify(credits, null, 2),
);

data.push(entry);
await Deno.writeTextFile(
  args.data,
  await format(JSON.stringify(data, null, 2), { parser: "json" }),
);

console.log(
  `
%cDay ${day} added to data.json, ${Object.keys(credits).length} pictures in ${directory}/`,
  "color: green",
);
console.log(`Next:
  1. check the answer, the years and the categories in data.json
  2. choose six pictures in ${directory}/ and rename them 1 to 6 (1 is the hardest)
  3. make credits DAY=${day}    fills the picture credits
  4. make convert DAY=${day}    resizes them into public/${day}/
  http://localhost:4000/day/${day}`);
