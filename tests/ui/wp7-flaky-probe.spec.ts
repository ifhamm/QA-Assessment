import { expect, test } from "@playwright/test";

// Temporary WP7 evidence probe, reverted in the next commit: the first attempt
// fails and the retry passes, so CI reports it as flaky without failing the run.
test("wp7 flaky probe @regression", async () => {
  expect(test.info().retry).toBeGreaterThan(0);
});
