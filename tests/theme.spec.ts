import { test, expect } from "./fixtures.ts";

// --color-background and --color-primary of src/assets/base.css
const LIGHT = { background: "rgb(255, 255, 255)", icon: "rgb(0, 0, 0)" };
const DARK = { background: "rgb(22, 24, 27)", icon: "rgb(244, 245, 247)" };

const expectColours = async (
  page: import("@playwright/test").Page,
  colours: typeof LIGHT,
) => {
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    colours.background,
  );
  await expect(page.locator("header svg").first()).toHaveCSS(
    "fill",
    colours.icon,
  );
};

test.describe("on a device set to dark", () => {
  test.use({ colorScheme: "dark" });

  test("the app is dark, the player can force light", async ({ page }) => {
    await page.goto("/about");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expectColours(page, DARK);
    // the browser's own interface follows
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      "#16181b",
    );
    await expect(
      page.getByRole("button", { name: "Same as device" }),
    ).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "Light" }).click();
    await expectColours(page, LIGHT);

    // the choice is kept, on every page
    await page.goto("/score");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expectColours(page, LIGHT);

    await page.goto("/about");
    await page.getByRole("button", { name: "Same as device" }).click();
    await expectColours(page, DARK);
  });

  test("the game is readable", async ({ page }) => {
    await page.goto("/day/0");
    await page.getByRole("button", { name: "Start playing!" }).click();

    await page.getByPlaceholder("Search for building name /").fill("eif");
    const match = page.locator("li mark").first();
    await expect(match).toHaveText(/eif/i);
    // the part of a name that matches the search is light on dark too
    await expect(match).toHaveCSS("color", DARK.icon);
  });
});

test("on a device set to light the app is light, the player can force dark", async ({
  page,
}) => {
  await page.goto("/about");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expectColours(page, LIGHT);

  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expectColours(page, DARK);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expectColours(page, DARK);
});

test("the app follows the device when it changes", async ({ page }) => {
  await page.goto("/about");
  await expectColours(page, LIGHT);

  await page.emulateMedia({ colorScheme: "dark" });
  await expectColours(page, DARK);
});
