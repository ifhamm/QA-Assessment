import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config();

const authFile = path.resolve("playwright/.auth/user.json");
const isCI = Boolean(process.env.CI);
// Set by the CI workflow for runs whose result should join the merged report.
// Local runs keep the HTML reporter and continue to write playwright-report/.
const blobOutputDir = process.env.PLAYWRIGHT_BLOB_OUTPUT_DIR;

export default defineConfig({
  testDir: "./tests",
  // Every test owns its data and the self-hosted stack has no shared global
  // identity, so there is no ordering dependency left to serialize.
  fullyParallel: true,
  // CI-only retry: one retry keeps a transient infrastructure blip from
  // turning into a red pipeline, while local runs stay retry-free so the
  // 10-run stability probe cannot hide flakiness.
  retries: isCI ? 1 : 0,
  workers: 4,
  reporter: blobOutputDir
    ? [["blob", { outputDir: blobOutputDir }], ["line"]]
    : "html",
  // Visual tests run only in the pinned Playwright container, so the image
  // below is the single rendering environment. These options keep the intent
  // explicit; the diff thresholds are the Playwright defaults and are not
  // relaxed.
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  use: {
    baseURL: process.env.BASE_URL,
    viewport: {
      width: 1280,
      height: 720,
    },
    // Fixed rendering inputs for screenshots: the app renders the same light
    // theme at the same time zone and locale on every run.
    colorScheme: "light",
    timezoneId: "UTC",
    locale: "en-US",
    // In CI, record a trace on the first retry so the original failed attempt
    // is available for triage. Locally, keep the trace for any failure.
    trace: isCI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "authenticated",
      dependencies: ["setup"],
      use: {
        browserName: "chromium",
        storageState: authFile,
      },
      testMatch: /dashboard\.spec\.ts/,
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      testIgnore: [/dashboard\.spec\.ts/, /visual\//],
      use: { browserName: "chromium" },
    },
    {
      // Kept out of every host-run project and executed by
      // `npm run test:visual` inside mcr.microsoft.com/playwright. It has no
      // setup dependency because visual tests do not reuse the auth file.
      name: "visual",
      testMatch: /visual\/.*\.visual\.spec\.ts$/,
      use: { browserName: "chromium" },
    },
  ],
});
