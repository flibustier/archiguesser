import type { Page } from "@playwright/test";

import { test, expect } from "./fixtures.ts";

// After a deploy, a tab opened before may not find the files of its pages
// anymore: it reloads on the current build (src/services/reload.ts). Only the
// production build does it (the CI tests it; with the development server
// these tests are skipped). Without the service worker, which would serve the
// files itself.
test.use({ serviceWorkers: "block" });

const SCORE_PAGE = /\/assets\/ScorePage-[\w-]+\.js$/;

// the loads of the whole page, the first one included
const countLoads = (page: Page) => {
  const loads: string[] = [];
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      loads.push(new URL(request.url()).pathname);
    }
  });
  return loads;
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("clientID", "test");
  });
});

const openDay = async (page: Page) => {
  await page.goto("/day/0");
  await expect(page.getByText("6 guesses remaining")).toBeVisible();
  const production = await page.locator('script[src^="/assets/"]').count();
  test.skip(!production, "no reload with the development server");
};

test("a page whose file is gone reloads once, then opens", async ({ page }) => {
  const loads = countLoads(page);
  // gone until the page reloads, which gets the files of the current build
  await page.route(SCORE_PAGE, (route) =>
    loads.length < 2 ? route.fulfill({ status: 404 }) : route.fallback(),
  );
  await openDay(page);

  await page.getByLabel("Show your score").click();

  await expect(
    page.getByRole("heading", { name: "Score", exact: true }),
  ).toBeVisible();
  expect(loads).toEqual(["/day/0", "/score"]);
});

test("a page that still fails after a reload is reported, not reloaded again", async ({
  page,
}) => {
  await page.route(SCORE_PAGE, (route) => route.fulfill({ status: 404 }));
  // the report is caught here (the fixture blocks Bugsink otherwise)
  const reports: string[] = [];
  await page.route(/^https:\/\/bug\.cracking\.ovh\//, (route) => {
    reports.push(route.request().postData() ?? "");
    return route.fulfill({ status: 200, body: "{}" });
  });
  const loads = countLoads(page);
  await openDay(page);

  await page.getByLabel("Show your score").click();

  await expect
    .poll(() => reports.some((report) => report.includes('"reload":"skipped"')))
    .toBe(true);
  expect(loads).toEqual(["/day/0", "/score"]);
});
