import { fileURLToPath, URL } from "node:url";

import { defineConfig, type PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";

import { game } from "./build/vite-plugin-game.ts";

const root = fileURLToPath(new URL(".", import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), game({ root }), visualizer() as PluginOption],
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
