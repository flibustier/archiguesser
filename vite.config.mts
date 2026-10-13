import { fileURLToPath, URL } from "node:url";
import { readdirSync, realpathSync, rmSync } from "node:fs";
import { basename, join } from "node:path";

import { defineConfig, type Plugin, type PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";

const PICTURE_FOLDERS_ID = "virtual:picture-folders";

// Replayed days are symlinks in public/ (e.g. public/1565 -> 919).
// Vite would copy each one as a full duplicate, so instead the app resolves
// them through a { day: folder } map and the copies are removed from dist/.
const pictureFolders = (): Plugin => {
  const publicDir = fileURLToPath(new URL("./public", import.meta.url));
  let outDir = "";

  const symlinkedDays = () =>
    readdirSync(publicDir, { withFileTypes: true })
      .filter((entry) => entry.isSymbolicLink() && /^\d+$/.test(entry.name))
      .map(({ name }) => [
        Number(name),
        Number(basename(realpathSync(join(publicDir, name)))),
      ]);

  return {
    name: "picture-folders",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    resolveId(id) {
      if (id === PICTURE_FOLDERS_ID) return "\0" + PICTURE_FOLDERS_ID;
    },
    load(id) {
      if (id === "\0" + PICTURE_FOLDERS_ID) {
        return `export default ${JSON.stringify(Object.fromEntries(symlinkedDays()))};`;
      }
    },
    closeBundle() {
      for (const [day] of symlinkedDays()) {
        rmSync(join(outDir, String(day)), { recursive: true, force: true });
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), pictureFolders(), visualizer() as PluginOption],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 4000,
  },
  build: {
    rollupOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              test: /node_modules/,
              name: "vue",
            },
            {
              test: /src\/assets\/data\.json/,
              name: "data",
            },
            {
              test: /src\/assets\/suggestions\.json/,
              name: "suggestions",
            },
            {
              test: /src\/assets\/recommendations\.json/,
              name: "recommendations",
            },
          ],
        },
      },
    },
  },
});
