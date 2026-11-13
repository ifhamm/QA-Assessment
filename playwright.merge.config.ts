import { defineConfig } from "@playwright/test";

// Used only by `merge-reports`. The visual tests render inside the pinned
// container, so their blob records `/work/tests`; host jobs record the runner
// checkout path. A merge config pins the test directory so both can be merged
// into one report. It is not used to run tests.
export default defineConfig({
  testDir: "./tests",
  reporter: "html",
});
