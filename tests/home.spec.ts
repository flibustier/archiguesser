import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/?day=0");
});

test("homepage is looking good", async ({ page }) => {
  await expect(page.getByLabel("Back to the daily challenge")).toContainText(
    "ArchiGuesser",
  );
  await expect(page).toHaveScreenshot();
});

test("picture 1 is shown", async ({ page }) => {
  await expect(
    page.getByRole("img", { name: "Picture 1 is loading…" }),
  ).toBeVisible();
  await expect(page.getByLabel("Replay previous days")).toBeVisible();
  await expect(page.getByRole("main")).toContainText("6 guesses remaining");
  await expect(
    page.getByPlaceholder("Search for building name /"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "SKIP" })).toBeVisible();
});

test("links are present", async ({ page }) => {
  await expect(page.getByLabel("Replay previous days")).toBeVisible();
  await expect(page.getByLabel("Play themed challenges")).toBeVisible();
  await expect(page.getByLabel("Show your score")).toBeVisible();
  await expect(page.getByLabel("LogIn to your account or show")).toBeVisible();
  await expect(page.getByLabel("Show informations about")).toBeVisible();
});

test("input is ready", async ({ page }) => {
  await expect(page.getByRole("main")).toContainText("6 guesses remaining");
  await expect(
    page.getByPlaceholder("Search for building name /"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "SKIP" })).toBeVisible();
});
