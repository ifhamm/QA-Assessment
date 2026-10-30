import { randomUUID } from "node:crypto";

/**
 * One identity per worker process.
 *
 * Playwright runs workers in separate Node processes, so this module-level
 * value is created independently in each worker and in the setup project.
 * The counter then separates every call inside that process.
 */
const runId = randomUUID().slice(0, 8);
let sequence = 0;

/**
 * Generates an identifier that cannot collide across workers or tests.
 *
 * `workerIndex` is included only to make generated data easy to trace back to
 * a worker. It is not required for uniqueness: the random run id separates
 * processes and the counter separates calls within one process.
 */
export function uniqueId(workerIndex = 0): string {
  sequence += 1;
  return `${runId}-w${workerIndex}-${sequence}`;
}

/** Generates unique user credentials. */
export function syntheticUser(workerIndex = 0) {
  const id = uniqueId(workerIndex);
  return {
    email: `testuser_${id}@example.com`,
    password: `Password_${id}!`,
    username: `testuser_${id}`,
  };
}

/** Generates unique article payload. */
export function syntheticArticle(prefix = "Test", workerIndex = 0) {
  const id = uniqueId(workerIndex);
  return {
    title: `${prefix} Article ${id}`,
    description: `Description for test article ${id}`,
    body: `Body content of the test article ${id}. This is **markdown**.`,
    tagList: ["e2e", "test"],
  };
}
