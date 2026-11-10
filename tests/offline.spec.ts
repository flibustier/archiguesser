import { test, expect } from "./fixtures.ts";

// The service worker only exists in the production build (the CI tests it;
// with the development server these tests are skipped).
test.use({ serviceWorkers: "allow" });

test.beforeEach(async ({ page, browserName }) => {
  test.skip(
    browserName !== "chromium",
    "service workers are tested on Chromium only",
  );
  await page.addInitScript(() => {
    window.localStorage.setItem("clientID", "test");
  });
  await page.goto("/day/0");

  const hasServiceWorker = await page.evaluate(() =>
    Promise.race([
      navigator.serviceWorker.ready.then(() => true),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3000)),
    ]),
  );
  test.skip(!hasServiceWorker, "no service worker with the development server");

  // from now on the page is served through the service worker
  await page.reload();
  await expect(page.getByText("6 guesses remaining")).toBeVisible();
});

test("a day already opened can be played offline", async ({
  page,
  context,
}) => {
  await context.setOffline(true);
  await page.reload();

  await expect(page.getByText("6 guesses remaining")).toBeVisible();
  const picture = page.getByRole("img", { name: "Picture 1 is loading…" });
  await expect(picture).toBeVisible();
  expect(
    await picture.evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThan(0);

  // the other pages of the app open too
  await page.getByLabel("Show your score").click();
  await expect(page.getByRole("heading", { name: "Score" })).toBeVisible();
  await page.goBack();

  // the result of a game finished offline waits for the connection
  for (let guess = 0; guess < 6; guess++) {
    await page.getByRole("button", { name: "SKIP" }).click();
  }
  await expect(page.getByRole("main")).toContainText("The answer was:");
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(window.localStorage.getItem("pendingResults") || "[]"),
      ),
    )
    .toEqual([{ day: 0, score: 0, guesses: ["", "", "", "", "", ""] }]);
});

test("a day never opened says it needs a connection", async ({
  page,
  context,
}) => {
  await context.setOffline(true);
  await page.goto("/day/1");

  await expect(page.getByRole("alert")).toContainText(
    "it looks like you are offline",
  );

  // and loads as soon as the connection is back
  await context.setOffline(false);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("6 guesses remaining")).toBeVisible();
});
