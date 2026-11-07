import { defineConfig, devices } from "@playwright/test";
import { siteHeader } from "./e2e/helpers/site";

/**
 * E2E suite for the Helpdesk SPA, run against a real bench site.
 * `global.setup.ts` seeds personas and saves one logged-in session per persona.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // CI shards write blob reports that the merge-reports job joins into one HTML report.
  reporter: process.env.CI ? [["github"], ["blob"]] : "list",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:8000",
    extraHTTPHeaders: siteHeader(),
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
    // Differs from a fresh site's Asia/Kolkata, so timezone bugs show up locally too.
    timezoneId: process.env.PLAYWRIGHT_TIMEZONE || "UTC",
    // PWA cache state is outside test isolation and can serve stale lazy chunks.
    serviceWorkers: "block",
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? {
          launchOptions: {
            executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          },
        }
      : {}),
  },
  projects: [
    { name: "setup", testMatch: /global\.setup\.ts/ },
    {
      name: "chromium",
      testMatch: /.*\.spec\.ts/,
      dependencies: ["setup"],
    },
  ],
});
