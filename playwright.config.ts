import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config();

const authFile = path.resolve("playwright/.auth/user.json");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: process.env.BASE_URL,
    viewport: {
      width: 1280,
      height: 720,
    },
    trace: "retain-on-failure",
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
