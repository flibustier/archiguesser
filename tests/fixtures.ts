import { test as base, expect } from "@playwright/test";

// Tests never reach the analytics nor the statistics servers: a test run must
// not count as visitors or results. The app is built to work without them.
const EXTERNAL_SERVICES =
  /^https?:\/\/(cabin\.archiguesser\.com|analytics\.archiguesser\.com|stats\.archiguesser\.com|localhost:8085)\//;

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(EXTERNAL_SERVICES, (route) => route.abort());
    await use(page);
  },
});

export { expect };
