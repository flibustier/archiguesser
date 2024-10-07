import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), visualizer()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 4000,
  },
  build: {
    cssMinify: "lightningcss",
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ["vue"],
          data: ["src/assets/data.json"],
          suggestions: ["src/assets/suggestions.json"],
          recommendations: ["src/assets/recommendations.json"],
        },
        // intro: 'import "./src/assets/base.css";',
      },
    },
  },
});
