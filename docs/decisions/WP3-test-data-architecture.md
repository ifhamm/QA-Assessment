# WP3 — Test Data Architecture

- **Date:** 2026-11-01
- **Branch:** `wp3/test-data-architecture`
- **Base:** `main` at `90e66ec` (WP2 merged)
- **Nature:** data-isolation refactor. No assertion, timeout, retry, test-count, snapshot, or config-default change.

## Context

After WP2 every authenticated test used its own identity, but the data layer still had gaps:

- Three places generated synthetic users inline: the `user` fixture, `auth.setup.ts`, and `syntheticUser()` was duplicated by the `Date.now()` + random-suffix pattern.
- `uniqueId()` was timestamp + 8 random characters. It is almost certainly unique, but nothing in the design made collisions *impossible* across workers, and the acceptance requires per-test **and** per-worker uniqueness.
- Cleanup could fail the test: `api.deleteUser()` threw on unexpected status, and the article fixture's cleanup login or UI create cleanup could throw, replacing the product failure with a teardown failure.
- The expected `405` user-deletion message and the occasional article `404` were logged from the API layer with no standard owner for "cleanup failed but we log it and move on".

## Options considered

### 1. Keep timestamp + random suffix

Fits the existing style, but uniqueness depends on `Date.now()` granularity and a small random suffix. It is "unique in practice", not "unique by construction", and it is invisible in the data which worker created it.

### 2. `crypto.randomUUID()` per identifier

Collision-safe, but generates large random strings per identifier and loses the per-worker traceability the PRD asks for.

### 3. Per-process run id + counter + worker label — chosen

`tests/test-data.ts` creates one `runId` per worker process (`crypto.randomUUID()`, first 8 characters) and a monotonic counter. `uniqueId(workerIndex)` produces `runId-w<N>-<seq>`:

- the random run id separates worker processes and the setup project cheaply and unambiguously;
- the counter separates every call inside one process, even two users created in the same millisecond;
- `workerIndex` is a readability label, not load-bearing: a call site that forgets it still cannot collide.

`syntheticUser(workerIndex)` and `syntheticArticle(prefix, workerIndex)` are the only generators. Fixtures, `auth.setup.ts`, and the UI tests all use them, so the inline duplication is gone. Factories remain lifecycle-free: they generate payloads, never call the API.

### 4. Worker-scoped shared user

One user per worker would reduce API calls, but it shares a mutable identity between tests, can be invalidated by token rotation, and is WP4 territory. Rejected again in WP3 for the same reason as WP1.

### 5. Pre-created user pool claimed by tests

Solves the API race more cheaply, but breaks per-test data ownership, which is the point of WP3. Rejected.

### 6. Cleanup behavior: fail the test vs best effort — chosen best effort

Failing a test because its article cleanup failed would hide the product failure the test was reporting. The chosen policy is a small helper, `tests/cleanup.ts`:

```ts
bestEffortCleanup(label, action)
```

- runs the teardown action;
- catches every error and logs `Cleanup: <label> failed: <message>`;
- never throws, so the test result always reflects the test.

Fixture teardown order (Playwright already runs it when the test fails) plus this wrapper covers both failure modes: the test failing after setup, and the cleanup call itself failing.

### 7. `405` user deletion

| Option | Assessment |
| --- | --- |
| Keep one warning per attempted deletion — chosen | Honest count of leaked synthetic users; no hidden contract change |
| Deduplicate to once per worker | Less noisy but hides how many users the run leaves behind |
| Stop attempting user deletion | Silently removes the warning; rejected |
| Fail tests on `405` | The API declares the endpoint unsupported; a 405 is expected, not a defect |

## Decision

- `tests/test-data.ts` is rewritten around the per-process run id + counter; `syntheticUser()` and `syntheticArticle()` carry a `workerIndex` label.
- The `user` and `article` fixtures create their data through the factories, pass `testInfo.workerIndex`, and clean up through `bestEffortCleanup()`.
- `auth.setup.ts` falls back to `syntheticUser(testInfo.workerIndex)` when auth variables are missing or wrong. The setup user is shared infrastructure for the dashboard and cannot be deleted (no endpoint); it is explicitly not per-test data.
- The UI create test keeps ownership of its article (created through the UI) and now:
  - works through `bestEffortCleanup()`;
  - recovers the slug from the page URL when the redirect assertion failed, so a published article is still deleted after a failure.
- The `article` fixture still logs in before deleting because the public API rotates tokens on every login; the whole teardown is wrapped, so a failed cleanup login cannot replace the test result.
- The standard fixture pattern is now uniformly: **setup via API → test → best-effort cleanup via API**, with one deliberate exception (the article created through the UI by the UI create test).

### What WP3 deliberately did not do

- No change to `fullyParallel: false`, `workers: 1`, or `retries: 0` in `playwright.config.ts`. Higher worker counts are WP4.
- No serialization, locking, or retry of registrations. Data isolation is WP3; making a globally broken API safe to run concurrently is WP4.
- No change to the Postman collection (its data is already dynamic).

### Evidence: the public API cannot keep concurrent identities

The 4-worker runs failed on the cross-layer tests with each test seeing another test's or the setup user's identity. A direct API probe outside the test suite confirmed this is a public backend defect, not test-data collision:

- 8 concurrent registrations: **6/8** returned tokens that resolved to a different user on `GET /user`.
- Batched probes: `concurrency=1` → 4/8 mismatches, `concurrency=2` → 5/8, `concurrency=3` → 8/9.
- Sequential probe: each registration/logins token returns the right identity *immediately*, but after subsequent registrations/logins, most earlier tokens become `401`: registrations and logins rotate **other users'** tokens. Identity is effectively global: only the most recently issued token stays valid.

WP3's data guarantees (unique users, articles, slugs) hold; the failure is a server-side identity mix-up under concurrency. WP4 owns the response to it.

## Trade-offs

- `bestEffortCleanup` means a cleanup failure cannot fail a test. Leaks are visible only through the log; they are not surfaced in the test report as artifacts.
- The expected `405` remains one warning per user per run, so a full run still logs 4 such warnings.
- The UI create test still owns its cleanup, and the fixture cannot pre-create a UI-published article. That boundary now also covers the "extract the slug from the URL when the redirect assertion failed" step.
- Factory data is longer than the old timestamp-based names (e.g. `testuser_ab12cd34-w2-7@example.com`). The visual editor snapshot masks the username, so no snapshot change was needed or made.

## Metrics

See `docs/metrics.md` for the WP3 table. Headlines:

- 9/9 tests pass individually with `--grep`.
- 9/9 pass with `--fully-parallel --workers=1` (1.0 min) and `--fully-parallel --workers=2` (59.4 s).
- 4-worker evidence: 7/9 and 8/9 before the run was traced to the API identity defect above. That run is recorded as an environment failure, not a data collision.
- Repeat probe at one worker: 41/41 passed (5.2 min).
- Cleanup probe (temporary spec, deleted before commit): a deliberately failing test still performed both cleanups, and the article was confirmed deleted by a subsequent API read returning `404`.
- Factory sites with inline duplication: 3 → 0.

## How to verify

```powershell
npm run typecheck
npx playwright test --list
# every test alone
foreach ($t in @(
  "authenticate via API",
  "opens the dashboard as an authenticated user",
  "article created via API is visible in the UI",
  "article updated via UI is reflected in the API",
  "login and create a new article",
  "shows error on invalid credentials",
  "redirects unauthenticated user away from editor",
  "article editor matches visual baseline",
  "login page matches visual baseline"
)) { npx playwright test -g $t --reporter=line }
# fullyParallel evidence
npx playwright test --fully-parallel --workers=1 --reporter=list
npx playwright test --fully-parallel --workers=2 --reporter=list
npx playwright test tests/ui --repeat-each=10 --reporter=list
```

Expected: 9/9 in each; the only cleanup warnings are the expected `405` user-deletion messages.

## Follow-ups

- WP4: worker counts, retries, and a concrete plan for the public API's global token behavior (options: stable self-hosted instance, per-run identity coordination, or accepting 1 worker in CI).
- UI create cleanup could be split out of the test body entirely without pre-creation; currently rejected because Playwright wants the slug after publish.
- Optional: attach cleanup warnings to the test report for one-click triage; not needed to satisfy the "logged" requirement.
