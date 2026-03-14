import { fileURLToPath, URL } from "node:url";

import { defineConfig, type PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), visualizer() as PluginOption],
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
