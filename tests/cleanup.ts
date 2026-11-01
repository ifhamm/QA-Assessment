/**
 * Runs a teardown step without changing the test result.
 *
 * Playwright invokes fixture teardown even when the test fails. This wrapper
 * covers the remaining failure mode: a cleanup call itself failing. Logging it
 * keeps the leak visible without replacing the test failure that caused the
 * teardown.
 */
export async function bestEffortCleanup(
  label: string,
  action: () => Promise<unknown>
): Promise<void> {
  try {
    await action();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Cleanup: ${label} failed: ${message}`);
  }
}
