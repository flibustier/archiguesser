import { test, expect } from "./fixtures.ts";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("clientID", "test");
  });

  await page.goto("/day/0");
});

test("Welcome modal is shown", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("clientID");
  });

  await page.goto("/day/0");

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
    "ArchiGuesser",
  );
  await expect(page.getByText("6 guesses remaining")).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test("picture 1 is shown", async ({ page }) => {
  await expect(
    page.getByRole("img", { name: "Picture 1 is loading…" }),
  ).toBeVisible();
  await expect(page.getByRole("main")).toContainText("6 guesses remaining");
  await expect(
    page.getByPlaceholder("Search for building name /"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "SKIP" })).toBeVisible();
  await expect(page).toHaveTitle(/ArchiGuesser #0/);
});

test("links are present", async ({ page }) => {
  await expect(page.getByLabel("Replay previous days")).toBeVisible();
  await expect(page.getByLabel("Play themed challenges")).toBeVisible();
  await expect(page.getByLabel("Show your score")).toBeVisible();
  await expect(page.getByLabel("LogIn to your account or show")).toBeVisible();
  await expect(page.getByLabel("Show informations about")).toBeVisible();
});

test("links shared before the router still work", async ({ page }) => {
  await page.goto("/?day=0");
  await expect(page).toHaveURL("/day/0");
  await expect(page).toHaveTitle(/ArchiGuesser #0/);

  await page.goto("/?challenge=famous");
  await expect(page).toHaveURL("/challenge/famous");
  await expect(page.getByRole("main")).toContainText("famous challenge");

  await page.goto("/#replay");
  await expect(page).toHaveURL("/replay");
  await expect(
    page.getByRole("heading", { name: "Replay Previous Days" }),
  ).toBeVisible();

  await page.goto("/#info");
  await expect(page).toHaveURL("/about");
});

test("an unknown address leads to today’s game", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("main")).toContainText("guesses remaining");

  await page.goto("/challenge/does-not-exist");
  await expect(page).toHaveURL("/challenges");
});

test("replay page is working", async ({ page }) => {
  await page.getByLabel("Replay previous days").click();
  await expect(page).toHaveURL("/replay");
  await expect(page).toHaveTitle("ArchiGuesser - Replay previous days");
  await expect(
    page.getByRole("heading", { name: "Replay Previous Days" }),
  ).toBeVisible();

  // without thumbnails, monuments are flagged
  await page.locator("label span").click();
  await expect(page.getByRole("main")).toContainText("🏛: Historic Monuments");

  // the most recent day of the list
  const day = page.getByRole("link", { name: /^Day \d+$/ }).first();
  const dayPath = (await day.getAttribute("href")) as string;
  expect(dayPath).toMatch(/^\/day\/\d+$/);
  await day.click();
  await expect(page).toHaveURL(dayPath);
  await expect(page.getByRole("main")).toContainText("6 guesses remaining");

  // the browser's back button returns to the list, then to the first day
  await page.goBack();
  await expect(page).toHaveURL("/replay");
  await page.goBack();
  await expect(page).toHaveURL("/day/0");
  await expect(page).toHaveTitle(/ArchiGuesser #0/);
});

test("themed challenges page is working", async ({ page }) => {
  await page.getByLabel("Play themed challenges").click();
  await expect(page).toHaveURL("/challenges");
  await expect(
    page.getByRole("heading", { name: "Projects By Theme" }),
  ).toBeVisible();
  await expect(page.getByText("Brazil")).toBeVisible();

  await expect(page).toHaveScreenshot();

  await page.getByText("Famous 0/").click();
  await expect(page).toHaveURL("/challenge/famous");
  await expect(page.getByRole("main")).toContainText(
    "You’re playing the famous challenge (level 0), you have 5 projects to guess properly to win!",
  );
});

test("a locked theme asks to sign in", async ({ page }) => {
  await page.goto("/challenges");

  await page.getByText("Brutalism").click();
  await expect(page.getByRole("main")).toContainText(
    "You must be signed in to play this challenge",
  );
  await expect(page).toHaveURL("/challenges");

  await page.getByText("You must be signed in").click();
  await expect(page).toHaveURL("/account");
});

test("score page is working", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "stats",
      JSON.stringify({ firstPlayed: 1, lastPlayed: 4, 1: 1, 2: 3, 3: 0, 4: 3 }),
    );
    window.localStorage.setItem("challenges", JSON.stringify({ famous: 2 }));
  });
  await page.goto("/day/0");

  await page.getByLabel("Show your score").click();
  await expect(page).toHaveURL("/score");
  await expect(page.getByRole("heading", { name: "Score" })).toBeVisible();
  // 7 + 5 + 1 + 5 for the days, 50 + 100 for the two levels
  await expect(page.locator(".score")).toHaveText("168");
  await expect(page.getByRole("main")).toContainText("Daily Challenges: 18");
  await expect(page.getByRole("main")).toContainText("Theme Challenges: 150");
  await expect(page.getByRole("main")).toContainText("4Played");
  await expect(page.getByRole("main")).toContainText("75%Found");
  await expect(page.getByLabel("Found in 3: 2")).toBeVisible();
  await expect(page.getByLabel("Not found: 1")).toBeVisible();

  await page.getByRole("button", { name: "How are points counted" }).click();
  await expect(page.getByRole("main")).toContainText(
    "50 bonus points when you’re signed in",
  );
});

test("account page is working", async ({ page }) => {
  await page.getByLabel("LogIn to your account or show").click();
  await expect(page).toHaveURL("/account");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("Save your progress");

  const submit = page.getByRole("button", { name: "Sign In/Sign Up" });
  await expect(submit).toBeDisabled();
  await page.getByLabel("Email").fill("ludwig@mvdr.com");
  await page.getByLabel("Password").fill("less is more");
  await expect(submit).toBeEnabled();
});

test("a signed-in player sees the account and can log out", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem("seeded")) {
      window.sessionStorage.setItem("seeded", "yes");
      window.localStorage.setItem(
        "login",
        btoa("ludwig@mvdr.com:less is more"),
      );
    }
  });
  await page.goto("/account");

  await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveValue("ludwig@mvdr.com");

  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});

test("a forgotten password can be reset by email", async ({ page }) => {
  let asked: { email?: string } = {};
  await page.route(/\/password\/forgot$/, async (route) => {
    asked = route.request().postDataJSON();
    await route.fulfill({ body: "ok" });
  });
  await page.goto("/account");

  await page.getByRole("button", { name: "Forgot your password?" }).click();
  await page.getByLabel("Email").fill("Ludwig@MVDR.com");
  await page.getByRole("button", { name: "Send me a link" }).click();

  await expect(page.getByRole("status")).toContainText(
    "If an account exists for this address, an email is on its way",
  );
  expect(asked.email).toBe("ludwig@mvdr.com");
});

test("the link received by email sets a new password and signs in", async ({
  page,
}) => {
  let received: { token?: string; password?: string } = {};
  await page.route(/\/password\/reset$/, async (route) => {
    received = route.request().postDataJSON();
    await route.fulfill({ json: "ludwig@mvdr.com" });
  });
  await page.route(/\/user$/, (route) =>
    route.fulfill({ json: { stats: '{"3":2}', challenges: "{}" } }),
  );
  await page.goto("/account?reset=" + "a".repeat(64));

  await expect(
    page.getByRole("heading", { name: "New password" }),
  ).toBeVisible();
  // the secret leaves the address at once, and the form survives a reload
  await expect(page).toHaveURL("/account");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "New password" }),
  ).toBeVisible();
  const save = page.getByRole("button", { name: "Save my new password" });
  await page.getByLabel("New password").fill("short");
  await expect(save).toBeDisabled();
  await page.getByLabel("New password").fill("less is more");
  await save.click();

  // signed in, the link is gone from the address bar
  await expect(page).toHaveURL("/account");
  await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveValue("ludwig@mvdr.com");
  expect(received).toMatchObject({
    token: "a".repeat(64),
    password: "less is more",
  });
});

test("analytics count a past day under its own address", async ({ page }) => {
  // what index.html answers to GoatCounter, which proposes the canonical address
  const countedPath = (canonical: string) =>
    page.evaluate((path) => window.goatcounter?.path?.(path), canonical);

  await page.goto("/day/12");
  expect(await countedPath("/")).toBe("/day/12");

  // a link shared before the router existed
  await page.goto("/?day=7");
  expect(await countedPath("/")).toBe("/day/7");

  await page.goto("/about");
  expect(await countedPath("/about")).toBe("/about");
});

test("an expired link says so", async ({ page }) => {
  await page.route(/\/password\/reset$/, (route) =>
    route.fulfill({
      status: 400,
      body: "This link is invalid or has expired",
    }),
  );
  await page.goto("/account?reset=" + "b".repeat(64));

  await page.getByLabel("New password").fill("less is more");
  await page.getByRole("button", { name: "Save my new password" }).click();

  await expect(page.getByRole("alert")).toContainText(
    "This link is invalid or has expired",
  );
});

test("an account can be deleted, after confirmation", async ({ page }) => {
  let deleted: { email?: string } = {};
  await page.route(/\/user\/delete$/, async (route) => {
    deleted = route.request().postDataJSON();
    await route.fulfill({ body: "deleted" });
  });
  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem("seeded")) {
      window.sessionStorage.setItem("seeded", "yes");
      window.localStorage.setItem(
        "login",
        btoa("ludwig@mvdr.com:less is more"),
      );
      window.localStorage.setItem("stats", JSON.stringify({ 1: 1 }));
    }
  });
  await page.goto("/account");

  await page.getByRole("button", { name: "Delete my account" }).click();
  await expect(page.getByRole("main")).toContainText("deleted for good");
  // nothing is sent before the confirmation
  expect(deleted.email).toBeUndefined();

  await page.getByRole("button", { name: "Yes, delete my account" }).click();
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  expect(deleted.email).toBe("ludwig@mvdr.com");
  // the scores stay on the device
  expect(await page.evaluate(() => window.localStorage.getItem("stats"))).toBe(
    '{"1":1}',
  );
});

test("about page is working", async ({ page }) => {
  await page.getByLabel("Show informations about").click();
  await expect(page).toHaveURL("/about");
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
  await expect(page.getByRole("main")).toContainText(
    "ArchiGuesser is a game for architects and enthusiasts",
  );

  await page
    .getByRole("link", { name: "Back to the daily challenge" })
    .last()
    .click();
  await expect(page).toHaveURL("/");
});
