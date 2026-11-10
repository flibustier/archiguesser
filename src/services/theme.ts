// Light or dark colours. By default the app follows the device; the player can
// force one of the two on the About page. The colours are in assets/base.css.

import { ref } from "vue";

export type Theme = "light" | "dark";
export type ThemeChoice = Theme | "auto";

// Also read by the script at the top of index.html, which sets the theme
// before the first paint: keep the key and the rule below identical there.
const STORAGE_KEY = "theme";

export const resolveTheme = (
  choice: ThemeChoice,
  deviceIsDark: boolean,
): Theme => (choice === "auto" ? (deviceIsDark ? "dark" : "light") : choice);

export const readThemeChoice = (): ThemeChoice => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return stored === "light" || stored === "dark" ? stored : "auto";
  } catch {
    // storage refused (private browsing in some browsers)
    return "auto";
  }
};

export const themeChoice = ref<ThemeChoice>(readThemeChoice());

const deviceTheme = () => window.matchMedia("(prefers-color-scheme: dark)");

const applyTheme = () => {
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(themeChoice.value, deviceTheme().matches);

  // the browser's own interface around the page (address bar, app title bar)
  const background = getComputedStyle(root)
    .getPropertyValue("--color-background")
    .trim();
  if (background) {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", background);
  }
};

export const setThemeChoice = (choice: ThemeChoice) => {
  themeChoice.value = choice;
  try {
    if (choice === "auto") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, choice);
    }
  } catch {
    // the choice lasts until the page is closed
  }
  applyTheme();
};

export const watchTheme = () => {
  applyTheme();
  // the device switches at sunset, or the player changes its settings
  deviceTheme().addEventListener("change", applyTheme);
};
