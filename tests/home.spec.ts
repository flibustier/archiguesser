import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("clientID", "test");
  });

  await page.goto("/?day=0");
});

test("Welcome modal is shown", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("clientID");
  });

  await page.goto("/?day=0");

  const heading = page.getByRole("heading", {
    name: "Welcome to ArchiGuesser!",
  });
  await expect(heading).toBeVisible();
  const validateButton = page.getByRole("button", { name: "Start playing!" });
  await expect(validateButton).toBeVisible();
  await validateButton.click();
  await expect(heading).not.toBeVisible();

  const clientID = await page.evaluate(() => {
    return window.localStorage.getItem("clientID");
  });
  expect(clientID).not.toBeNull();
});

test("homepage is looking good", async ({ page }) => {
  await expect(page.getByLabel("Back to the daily challenge")).toContainText(
    "ArchiGuesser"
  );
  await expect(page).toHaveScreenshot();
});

test("picture 1 is shown", async ({ page }) => {
  await expect(
    page.getByRole("img", { name: "Picture 1 is loading…" })
  ).toBeVisible();
  await expect(page.getByLabel("Replay previous days")).toBeVisible();
  await expect(page.getByRole("main")).toContainText("6 guesses remaining");
  await expect(
    page.getByPlaceholder("Search for building name /")
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
    page.getByPlaceholder("Search for building name /")
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "SKIP" })).toBeVisible();
});

test("replay modal is working", async ({ page }) => {
  await page.getByLabel("Replay previous days").click();
  await expect(page.getByRole("heading")).toContainText("Replay Previous Days");
  await page.locator("label span").click();
  await expect(page.getByRole("paragraph")).toContainText(
    "🏛: Historic Monuments"
  );
  await page
    .locator("div")
    .filter({ hasText: /^Replay Previous Days$/ })
    .getByRole("img")
    .click();
});

test("themed challenge modal is working", async ({ page }) => {
  await page.getByLabel("Play themed challenges").click();
  await expect(page.getByRole("heading")).toContainText("Projects By Theme");

  await expect(page).toHaveScreenshot();

  await page.getByText("Famous 0/").click();
  await expect(page.getByRole("main")).toContainText(
    "You’re playing the famous challenge (level 0), you have 5 projects to guess properly to win!"
  );
});

test("score modal is working", async ({ page }) => {
  await page.getByLabel("Show your score").click();
  await expect(page.locator("h2")).toContainText("Score");
  await page
    .locator("div")
    .filter({ hasText: /^Score$/ })
    .getByRole("img")
    .click();
});

test("LogIn modal is working", async ({ page }) => {
  await page.getByLabel("LogIn to your account or show").click();
  await expect(page.getByText("Sign In Save your progress")).toBeVisible();
  await page
    .locator("div")
    .filter({ hasText: /^Sign In$/ })
    .getByRole("img")
    .click();
});

test("Information modal is working", async ({ page }) => {
  await page.getByLabel("Show informations about").click();
  await expect(page.getByText("About ArchiGuesser is a game")).toBeVisible();
  await expect(page.getByRole("heading")).toContainText("About");
  await page
    .locator("div")
    .filter({ hasText: /^About$/ })
    .getByRole("img")
    .click();
});
