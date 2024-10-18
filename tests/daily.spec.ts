import { test, expect } from "@playwright/test";
import { json } from "./api.mock.ts";

test.beforeEach(async ({ page }) => {
  await page.goto("/?day=0");

  await page.route(
    "https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=Eiffel_Tower",
    async (route) => {
      await route.fulfill({ json });
    },
  );
});

test("win a daily game", async ({ page }) => {
  // skip first guess
  await page.getByRole("button", { name: "SKIP" }).click();
  // second picture should show
  await expect(page.getByRole("button", { name: "2" })).toBeVisible();
  // try a wrong guess
  await page.getByPlaceholder("Search for building name /").click();
  await page
    .getByPlaceholder("Search for building name /")
    .fill("united nations");
  // use keyboard to select first result
  await page.getByPlaceholder("Search for building name /").press("Enter");
  // use keyboard to validate the guess
  await page.getByPlaceholder("Search for building name /").press("Enter");
  // the guess should be shown in history
  await expect(page.getByRole("main")).toContainText(
    "United Nations Headquarters in New York / Le Corbusier, Harrison Wallace Kirkman, Nikolai Bassov, Gaston Brunfaut, Ernest Cormier, Liang Seu-Cheng, Sven Markelius, Oscar Niemeyer, Howard Robertson, Argyle Soilleux Garnet, Julio Vilamajo / New York, United States of America (USA)",
  );
  // A hint should be shown
  await expect(page.getByRole("main")).toContainText(
    "Hint: Built in 1887-1889.",
  );
  // 4 guesses remaining
  await expect(page.getByRole("main")).toContainText("4 guesses remaining");
  // skip the next guess
  await page.getByRole("button", { name: "SKIP" }).click();
  // A new hint should be shown
  await expect(page.getByRole("main")).toContainText(
    "Hint: Built in 1887-1889. The location is France",
  );
  // try the right guess
  await page.getByPlaceholder("Search for building name /").click();
  await page.getByPlaceholder("Search for building name /").fill("eif");
  await expect(page.getByRole("list")).toContainText(
    "Eiffel Tower / Gustave Eiffel / Paris, France",
  );
  // click on first result
  await page
    .locator("li")
    .filter({ hasText: "Eiffel Tower / Gustave Eiffel" })
    .click();
  // click on submit button
  await page.getByRole("button", { name: "SUBMIT" }).click();

  // we should have won the game
  await expect(page.getByRole("heading")).toContainText("You got it! 🎉");
  await expect(page.locator("#share-message")).toContainText(
    "🟥 🟥 🟥 🟩 ⬛ ⬛",
  );
  await page.getByRole("link", { name: "Show Guesses" }).click();
  await expect(page).toHaveScreenshot({ fullPage: true });

  // click on "Learn more about it" button
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Learn more about it" }).click();
  const page1 = await page1Promise;
  // should open wikipedia page
  await expect(page1.locator("#firstHeading")).toContainText("Eiffel Tower");

  // click on "Try another one!" button
  await page.getByRole("button", { name: "Try another one!" }).click();
  // should show the replay modal
  await page
    .locator("div")
    .filter({ hasText: /^Today$/ })
    .nth(1)
    .click();
  // we should have 6 guesses remaining
  await expect(page.getByRole("main")).toContainText("6 guesses remaining");
});

test("lose a daily game", async ({ page }) => {
  // skip all guesses
  await page.getByRole("button", { name: "SKIP" }).click();
  await page.getByRole("button", { name: "SKIP" }).click();
  await page.getByRole("button", { name: "SKIP" }).click();
  await page.getByRole("button", { name: "SKIP" }).click();
  await page.getByRole("button", { name: "SKIP" }).click();
  await page.getByRole("button", { name: "SKIP" }).click();

  await expect(page.getByText("🟥 🟥 🟥 🟥 🟥 🟥")).toBeVisible();
  await page.getByRole("link", { name: "Show Guesses" }).click();
  await expect(page).toHaveScreenshot({ fullPage: true });
});
