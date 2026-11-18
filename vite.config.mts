import { fileURLToPath, URL } from "node:url";

import { defineConfig, type PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";

import { game } from "./build/vite-plugin-game.ts";
import config from "./src/config.json" with { type: "json" };

const root = fileURLToPath(new URL(".", import.meta.url));

// Without a BUGSINK_DSN in config.json, errors.ts never loads errors-sdk.js and
// nothing refers to it anymore, but Rolldown still writes it: leave it out.
const errorsSdkOnlyWithDsn = (): PluginOption => ({
  name: "errors-sdk-only-with-dsn",
  apply: "build",
  generateBundle(_options, bundle) {
    if (!config.BUGSINK_DSN) {
      delete bundle["assets/errors-sdk.js"];
      delete bundle["assets/errors-sdk.js.map"];
    }
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    game({ root }),
    errorsSdkOnlyWithDsn(),
    visualizer() as PluginOption,
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 4000,
  },
  build: {
    // Source maps are sent to Bugsink when deploying (scripts/sourcemaps.sh),
    // never published
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        // errors-sdk keeps its name from one deploy to the next: a tab opened
        // before a deploy can still load it to report an error, when the
        // hashed files of the old build are gone
        chunkFileNames: (chunk) =>
          chunk.name === "errors-sdk"
            ? "assets/errors-sdk.js"
            : "assets/[name]-[hash].js",
        codeSplitting: {
          groups: [
            {
              // The Sentry SDK stays in errors-sdk, loaded after an error only
              test: (id) =>
                id.includes("node_modules") && !id.includes("@sentry"),
              name: "vue",
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
