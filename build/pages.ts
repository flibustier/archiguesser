// One HTML file per URL of the app. They are all copies of index.html with
// their own title, description, canonical URL and preview image, so that
// GitHub Pages answers 200 (not its 404 fallback) and shared links look right.

import type { GameIndex } from "../src/services/types.ts";

export interface PageMeta {
  file: string; // path inside dist/
  path: string; // URL path
  title: string;
  description?: string;
  image?: string; // URL path of the preview image
  canonical?: string; // URL path given to search engines, `path` by default
}

const APP = "ArchiGuesser";

export const staticPages = (
  index: GameIndex,
  days: number[],
  pictureFolder: (day: number) => number,
): PageMeta[] => [
  {
    file: "replay.html",
    path: "/replay",
    title: `${APP} - Replay previous days`,
    description:
      "Missed a day? Replay the architectural projects of the last 60 days.",
  },
  {
    file: "challenges.html",
    path: "/challenges",
    title: `${APP} - Themed challenges`,
    description:
      "Museums, castles, skyscrapers, Le Corbusier, Japan… Pick a theme and guess a series of architectural projects from a single picture each.",
  },
  {
    file: "score.html",
    path: "/score",
    title: `${APP} - Your score`,
  },
  {
    file: "account.html",
    path: "/account",
    title: `${APP} - Your account`,
  },
  {
    file: "about.html",
    path: "/about",
    title: `${APP} - About`,
  },
  ...days.map((day) => ({
    file: `day/${day}.html`,
    path: `/day/${day}`,
    title: `${APP} #${day} - Guess the architectural project from the pictures`,
    description: `Can you guess the architectural project #${day} from its pictures? You have 6 tries!`,
    image: `/${pictureFolder(day)}/1.jpg`,
    // Past days are reached from /replay (the last 60) or from a shared link,
    // not from a search engine: for these, a day is the home page.
    canonical: "/",
  })),
  ...index.categories
    .filter(({ name }) => name !== "test")
    .map(({ name, slug }) => ({
      file: `challenge/${slug}.html`,
      path: `/challenge/${slug}`,
      title: `${APP} - ${name} challenge`,
      description: `How well do you know ${name}? Guess a series of architectural projects from a single picture each, no mistake allowed!`,
      image: `/categories/${encodeURIComponent(name)}.jpg`,
    })),
];

const escapeAttribute = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const setContent = (html: string, attribute: string, value: string) => {
  const pattern = new RegExp(`(<meta ${attribute} content=")[^"]*(")`);
  if (!pattern.test(html)) {
    throw new Error(`index.html has no <meta ${attribute}>`);
  }

  return html.replace(pattern, `$1${escapeAttribute(value)}$2`);
};

export const renderPage = (
  template: string,
  page: PageMeta,
  siteURL: string,
): string => {
  let html = template
    .replace(
      /<title>[^<]*<\/title>/,
      `<title>${escapeAttribute(page.title)}</title>`,
    )
    .replace(
      /(<link rel="canonical" href=")[^"]*(")/,
      `$1${siteURL}${page.canonical ?? page.path}$2`,
    );
  html = setContent(html, 'property="og:url"', siteURL + page.path);
  html = setContent(html, 'property="og:title"', page.title);
  if (page.description) {
    html = setContent(html, 'name="description"', page.description);
    html = setContent(html, 'property="og:description"', page.description);
  }
  if (page.image) {
    html = setContent(html, 'property="og:image"', siteURL + page.image);
  }

  return html;
};
