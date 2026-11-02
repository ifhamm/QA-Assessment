import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config();

const authFile = path.resolve("playwright/.auth/user.json");
const isCI = Boolean(process.env.CI);

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
  reporter: "html",
  use: {
    baseURL: process.env.BASE_URL,
    viewport: {
      width: 1280,
      height: 720,
    },
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
      testIgnore: /dashboard\.spec\.ts/,
      use: { browserName: "chromium" },
    },
  ],
});
