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
    rollupOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              test: /node_modules/,
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
