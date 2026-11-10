// Pure helpers of `make propose` (no network, unit-tested): turn what
// Wikidata and Wikimedia Commons know about a building into a data.json entry.

export interface Facts {
  label: string;
  architects: string[];
  city?: string;
  country?: string;
  inception?: number;
  opening?: number;
  wikipedia?: string;
  instanceOf: string[];
  styles: string[];
}

export interface CommonsFile {
  title: string; // "File:Villa Savoye.jpg"
  url: string; // direct link to a version of reasonable size
  page: string; // description page, where author and licence are stated
  width: number;
  height: number;
  mime: string;
  license: string; // "CC BY-SA 4.0"
  author: string; // may contain HTML
  assessments: string; // "featured|quality|valued"
}

// Wikidata's country names -> the names used in data.json
const COUNTRY_ALIASES: Record<string, string> = {
  "People's Republic of China": "China",
  "Kingdom of the Netherlands": "Netherlands",
  "Czech Republic": "Czechia",
  Türkiye: "Turkey",
};

export const countryName = (
  wikidataName: string | undefined,
  knownCountries: string[],
): string => {
  if (!wikidataName) {
    return "";
  }
  const name = COUNTRY_ALIASES[wikidataName] || wikidataName;
  const known = knownCountries.filter(
    (country) =>
      country === name ||
      // "United States" -> "United States of America (USA)"
      country.startsWith(name + " "),
  );

  return known.sort((a, b) => a.length - b.length)[0] || name;
};

// "Name / Architects / City, Country", as the game expects
export const buildAnswer = (facts: Facts, knownCountries: string[]): string =>
  [
    facts.label,
    facts.architects.join(", "),
    [facts.city, countryName(facts.country, knownCountries)]
      .filter(Boolean)
      .join(", "),
  ]
    .filter(Boolean)
    .join(" / ");

const year = (value: number) => (value < 0 ? `${-value} BC` : `${value}`);

// "1928-1931", "1889" or "" when nothing is known
export const buildYears = ({ inception, opening }: Facts): string => {
  if (inception === undefined) {
    return opening === undefined ? "" : year(opening);
  }

  return opening !== undefined && opening > inception
    ? `${year(inception)}-${year(opening)}`
    : year(inception);
};

// Words of Wikidata's classes and styles -> categories used in data.json
const CATEGORY_KEYWORDS: [RegExp, string][] = [
  [/museum|gallery/i, "museum"],
  [/castle|fortress|château|palace/i, "castle"],
  [/library/i, "library"],
  [
    /church|cathedral|chapel|mosque|temple|synagogue|monastery|abbey|basilica|shrine|stupa/i,
    "religious",
  ],
  [/skyscraper/i, "skyscraper"],
  [/concert hall|opera|philharmon/i, "concert hall"],
  [/monument|memorial|archaeological|world heritage/i, "monument"],
  [/housing|residential|apartment/i, "housing"],
  [/bridge/i, "bridge"],
  [/stadium|arena/i, "stadium"],
  [/university|school|campus/i, "university"],
  [/brutalis/i, "brutalism"],
  [/modern(ism|ist)? architecture|international style|bauhaus/i, "modernism"],
  [/art nouveau/i, "art-nouveau"],
  [/postmodern/i, "postmodern"],
  [/high-tech/i, "high-tech"],
];

export const guessCategories = ({ instanceOf, styles }: Facts): string[] => {
  const words = [...instanceOf, ...styles].join(" | ");

  return CATEGORY_KEYWORDS.filter(([pattern]) => pattern.test(words)).map(
    ([, category]) => category,
  );
};

// Licences that allow reuse with attribution (or without any condition)
const FREE_LICENSE =
  /^(cc0|cc[ -]by(-sa)?[ -]\d|public domain|pd\b|no restrictions)/i;

export const isUsable = (file: CommonsFile): boolean =>
  /^image\/(jpeg|png)$/.test(file.mime) &&
  Math.max(file.width, file.height) >= 1200 &&
  FREE_LICENSE.test(file.license.trim());

// Pictures the community marked as good come first, then the largest
export const rankFiles = (files: CommonsFile[]): CommonsFile[] => {
  const quality = ({ assessments }: CommonsFile) =>
    (/featured/.test(assessments) ? 4 : 0) +
    (/quality/.test(assessments) ? 2 : 0) +
    (/valued/.test(assessments) ? 1 : 0);

  return files
    .filter(isUsable)
    .sort(
      (a, b) =>
        quality(b) - quality(a) || b.width * b.height - a.width * a.height,
    );
};

// "<a href="//commons…/User:Benh">Benh LIEU SONG</a>" -> "Benh LIEU SONG"
export const authorName = (html: string): string =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

// Credit shown under a picture, in the style of the existing ones
export const credit = (file: CommonsFile): string => {
  const author = authorName(file.author);

  return author ? `${author} (wikimedia)` : "wikimedia";
};

// Normalised name, to spot a project that is already in data.json
export const nameKey = (answer: string): string =>
  answer
    .split(" / ")[0]
    .replace(/\(.*?\)/g, " ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const parseTarget = (
  target: string,
): { qid: string } | { lang: string; title: string } | undefined => {
  const qid = target.match(
    /^(?:https?:\/\/www\.wikidata\.org\/wiki\/)?(Q\d+)$/i,
  );
  if (qid) {
    return { qid: qid[1].toUpperCase() };
  }
  const article = target.match(
    /^https?:\/\/([a-z-]+)\.(?:m\.)?wikipedia\.org\/wiki\/([^?#]+)/i,
  );
  if (article) {
    return {
      lang: article[1],
      title: decodeURIComponent(article[2]).replace(/_/g, " "),
    };
  }

  return undefined;
};
