import { defineConfig } from "@playwright/test";

// Used only by `merge-reports`. The visual tests render inside the pinned
// container, so their blob records `/work/tests`; host jobs record the runner
// checkout path. A merge config pins the test directory so both can be merged
// into one report. It is not used to run tests.
//
// The merged run also emits JUnit and JSON: the JSON feeds the job summary and
// gate script, the JUnit file is the standard hand-off for CI consumers.
export default defineConfig({
  testDir: "./tests",
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
    ["junit", { outputFile: "test-results/merged-junit.xml" }],
    ["json", { outputFile: "test-results/merged.json" }],
  ],
});
