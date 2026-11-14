import { expect, test } from "@playwright/test";

// Temporary WP7 evidence probe. It is reverted in the next commit; it exists
// only to prove that a smoke failure produces a red Quality Gate and a
// traceable entry in the job summary.
test("wp7 intentional failure probe @smoke", async () => {
  expect("actual").toBe("expected");
});
