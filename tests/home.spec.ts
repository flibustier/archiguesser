import { test, expect } from "@playwright/test";

test("title is present", async ({ page }) => {
  await page.goto("http://localhost:4000/");

  await expect(page.getByLabel("Back to the daily challenge")).toContainText(
    "ArchiGuesser",
  );
});

test("picture 1 is shown", async ({ page }) => {
  await page.goto("http://localhost:4000/");

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
  await page.goto("http://localhost:4000/");

  await expect(page.getByLabel("Replay previous days")).toBeVisible();
  await expect(page.getByLabel("Play themed challenges")).toBeVisible();
  await expect(page.getByLabel("Show your score")).toBeVisible();
  await expect(page.getByLabel("LogIn to your account or show")).toBeVisible();
  await expect(page.getByLabel("Show informations about")).toBeVisible();
});

test("input is ready", async ({ page }) => {
  await page.goto("http://localhost:4000/");

  await expect(page.getByRole("main")).toContainText("6 guesses remaining");
  await expect(
    page.getByPlaceholder("Search for building name /"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "SKIP" })).toBeVisible();
});

test("get started link", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Click the get started link.
  await page.getByRole("link", { name: "Get started" }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(
    page.getByRole("heading", { name: "Installation" }),
  ).toBeVisible();
});
