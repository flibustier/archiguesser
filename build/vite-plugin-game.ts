// Vite plugin holding everything ArchiGuesser generates around the app:
//
// - virtual:picture-folders  { day: folder } for replayed days (symlinks)
// - virtual:game-index       small index of the collection (see GameIndex)
// - /data/**.json            the split data files, served in dev, written at build
// - one HTML file per URL    so that GitHub Pages answers 200 with the right
//                            title and preview image on /replay, /day/12, …

import { readdirSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import type { Plugin } from "vite";

import {
  allDays,
  buildAnswers,
  buildChallenge,
  buildDay,
  buildIndex,
  validate,
} from "./game-data.ts";
import { type PageMeta, renderPage, staticPages } from "./pages.ts";
import type { GameIndex, Project } from "../src/services/types.ts";

const PICTURE_FOLDERS_ID = "virtual:picture-folders";
const GAME_INDEX_ID = "virtual:game-index";

interface Options {
  root: string; // project root, absolute
}

export const game = ({ root }: Options): Plugin => {
  const publicDir = join(root, "public");
  const dataFile = join(root, "src/assets/data.json");
  const suggestionsFile = join(root, "src/assets/suggestions.json");
  const configFile = join(root, "src/config.json");
  let outDir = "";

  const readJSON = (file: string) => JSON.parse(readFileSync(file, "utf8"));
  const readProjects = (): Project[] => readJSON(dataFile);
  const readConfig = () => readJSON(configFile);
  const categoryNames = (): string[] => {
    const config = readConfig();

    return [
      ...config.LISTED_CATEGORIES,
      ...config.LOCKED_CATEGORIES_LOGGED,
      "test",
    ];
  };
  const readIndex = (): GameIndex =>
    buildIndex(readProjects(), categoryNames());

  // Replayed days are symlinks in public/ (e.g. public/1565 -> 919).
  // Vite would copy each one as a full duplicate, so instead the app resolves
  // them through a { day: folder } map and the copies are removed from dist/.
  const symlinkedDays = (): [number, number][] =>
    readdirSync(publicDir, { withFileTypes: true })
      .filter((entry) => entry.isSymbolicLink() && /^\d+$/.test(entry.name))
      .map(({ name }) => [
        Number(name),
        Number(basename(realpathSync(join(publicDir, name)))),
      ]);

  // /data/… -> content, undefined when the file does not exist
  const dataFileContent = (path: string): unknown => {
    const projects = readProjects();
    const day = path.match(/^\/data\/day\/(\d+)\.json$/);
    if (day) {
      return buildDay(projects, Number(day[1]));
    }
    const challenge = path.match(/^\/data\/challenge\/([a-z0-9-]+)\.json$/);
    if (challenge) {
      const category = readIndex().categories.find(
        ({ slug }) => slug === challenge[1],
      );

      return category && buildChallenge(projects, category.name);
    }
    if (path === "/data/answers.json") {
      return buildAnswers(projects, readJSON(suggestionsFile));
    }

    return undefined;
  };

  return {
    name: "archiguesser-game",

    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },

    buildStart() {
      const problems = validate(readProjects());
      if (problems.length > 0) {
        this.error("data.json is invalid:\n- " + problems.join("\n- "));
      }
    },

    resolveId(id) {
      if (id === PICTURE_FOLDERS_ID || id === GAME_INDEX_ID) {
        return "\0" + id;
      }
    },

    load(id) {
      if (id === "\0" + PICTURE_FOLDERS_ID) {
        return `export default ${JSON.stringify(Object.fromEntries(symlinkedDays()))};`;
      }
      if (id === "\0" + GAME_INDEX_ID) {
        this.addWatchFile(dataFile);
        this.addWatchFile(configFile);

        return `export default ${JSON.stringify(readIndex())};`;
      }
    },

    // dev server: the data files are computed on request
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = (request.url || "").split("?")[0];
        if (!path.startsWith("/data/")) {
          return next();
        }
        const content = dataFileContent(path);
        response.statusCode = content === undefined ? 404 : 200;
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(content ?? null));
      });
      // a new day in data.json must be visible without restarting
      server.watcher.add(dataFile);
      server.watcher.on("change", (file) => {
        if (file === dataFile || file === configFile) {
          const module = server.moduleGraph.getModuleById("\0" + GAME_INDEX_ID);
          if (module) {
            server.moduleGraph.invalidateModule(module);
          }
          server.ws.send({ type: "full-reload" });
        }
      });
    },

    // production build: the data files are written next to the app
    generateBundle() {
      const projects = readProjects();
      const emit = (fileName: string, content: unknown) =>
        this.emitFile({
          type: "asset",
          fileName,
          source: JSON.stringify(content),
        });

      for (const day of allDays(projects)) {
        emit(`data/day/${day}.json`, buildDay(projects, day));
      }
      for (const { name, slug } of readIndex().categories) {
        emit(`data/challenge/${slug}.json`, buildChallenge(projects, name));
      }
      emit(
        "data/answers.json",
        buildAnswers(projects, readJSON(suggestionsFile)),
      );
    },

    async closeBundle() {
      if (!outDir) {
        return;
      }
      for (const [day] of symlinkedDays()) {
        rmSync(join(outDir, String(day)), { recursive: true, force: true });
      }

      let template: string;
      try {
        template = readFileSync(join(outDir, "index.html"), "utf8");
      } catch {
        return; // the build failed before writing index.html
      }
      const folders = Object.fromEntries(symlinkedDays());
      const pages: PageMeta[] = staticPages(
        readIndex(),
        allDays(readProjects()),
        (day) => folders[day] ?? day,
      );
      await Promise.all(
        pages.map(async (page) => {
          const file = join(outDir, page.file);
          await mkdir(dirname(file), { recursive: true });
          await writeFile(file, renderPage(template, page, readConfig().URL));
        }),
      );
      // Any other URL (a typo, an old link) still boots the app
      await writeFile(join(outDir, "404.html"), template);
    },
  };
};
