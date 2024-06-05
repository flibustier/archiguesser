import { join } from "node:path";
import { test, expect } from "@playwright/test";

test("play test challenge", async ({ page }) => {
  await page.goto("/?challenge=test");

  await expect(page).toHaveScreenshot({
    stylePath: join(__dirname, "style-when-screenshot.css"),
  });
});
