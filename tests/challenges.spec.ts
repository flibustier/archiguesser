import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));

import { test, expect } from "./fixtures.ts";

test("play test challenge", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("clientID", "test");
  });

  await page.goto("/challenge/test");
  await expect(page.getByRole("main")).toContainText("You got it!!");

  await expect(page).toHaveScreenshot({
    fullPage: true,
    stylePath: join(__dirname, "style-when-screenshot.css"),
  });
});
