# WP3: Test Data Architecture

## Summary

This PR makes per-test data ownership explicit and provable: user/article identifiers are unique by construction across tests and workers, fixtures own the full setup → test → best-effort cleanup lifecycle, and cleanup failures can no longer replace a test result. It also documents — with direct API evidence — why the suite cannot currently go above one worker against the public RealWorld backend.

It is a data refactor: the test count (9), assertions, timeouts, retries, and visual snapshots are unchanged. Committed config defaults (`fullyParallel: false`, `workers: 1`, `retries: 0`) are unchanged.

## What changed

- `tests/test-data.ts`
  - Identifier = `<runId>-w<workerIndex>-<counter>`: one `crypto.randomUUID()`-derived run id per worker process, a visible worker label, and a monotonic counter.
  - Collisions across tests, workers, and the setup project are impossible by construction; uniqueness does not depend on `workerIndex` being passed.
  - Factories stay lifecycle-free.
- `tests/cleanup.ts` (new)
  - `bestEffortCleanup(label, action)`: catches every cleanup error, logs a labeled warning, and never throws, so a teardown failure cannot hide the test failure that caused it.
- `fixtures/test-base.ts`
  - `user`: uses `syntheticUser(testInfo.workerIndex)`; deletion is wrapped in `bestEffortCleanup` (expected `405` warning stays one per attempt).
  - `article`: uses `syntheticArticle("Fixture", testInfo.workerIndex)`; the whole relogin + deletion teardown is wrapped.
- `tests/auth.setup.ts`
  - Session-local fallback user uses the factory; the setup user is explicitly documented as shared infrastructure that the API cannot delete.
- `tests/ui/ui-functional.spec.ts`
  - Uses the factories with `test.info().workerIndex`.
  - The UI-created article's `finally` cleanup uses `bestEffortCleanup` and recovers the slug from the page URL when the redirect assertion failed, so a successfully published article is still deleted after a failure.
- `README.md`, `docs/decisions/WP3-test-data-architecture.md`, `docs/metrics.md`, `docs/progress.md`
  - Data/cleanup architecture, before/after metrics, decision note, tracker refresh.

No changes to `playwright.config.ts`, the CI workflow, page objects, `api/conduit-api.ts`, or the Postman collection.

## Why

WP0–WP2 left the data layer with implicit uniqueness: `Date.now()` + a short random suffix, and three call sites duplicating the generator. There was no standard for "cleanup failed but logged", no proof that tests are order-independent, and the known `405` cleanup warning had no owner.

The PRD asks WP3 for per-test **and** per-worker uniqueness, one standard fixture pattern, and evidence that every test runs alone and with `fullyParallel: true`.

## Isolation model

| Data owner | Source | Cleanup |
| --- | --- | --- |
| Every Playwright test except setup | `user` fixture → API `registerUser` | best-effort API delete attempt; `405` expected and logged |
| Article-producing tests | `article` fixture → API `createArticle` | best-effort relogin + API delete (relogin remains because the public API rotates tokens on login) |
| UI create test | article created through the browser | test-owned `finally` cleanup with slug recovery from the URL |
| Dashboard | shared setup `storageState` | no per-test data; setup user is infrastructure (no deletion endpoint) |
| Invalid-login test | throwaway `syntheticUser()` from the factory | nothing persisted |

## Evidence

### Isolation

| Probe | Result |
| --- | --- |
| 9 tests run individually with `--grep` | **9/9 PASS** |
| `--fully-parallel --workers=1` | **9 passed** (1.0 min) |
| `--fully-parallel --workers=2` | **9 passed** (59.4 s) |
| `tests/ui --repeat-each=10` (1 worker) | **41/41 passed** (5.2 min) |
| Cleanup-on-failure probe (temporary spec, deleted before commit) | Failing test still ran teardown: article deletion confirmed by a later API read returning `404`, user deletion attempted (`405` warning logged) |
| Hard-coded emails/usernames/slugs that can collide | 0 |
| Confirmed data collisions across workers | 0 |

### Environment limitation found (recorded honestly)

`--fully-parallel --workers=4` was run twice (7/9 and 8/9 passed). The failing cross-layer tests saw a different user identity than their own, with unique IDs — not data collisions. Direct API probes outside the test suite confirmed the cause is in the public backend:

| Probe | Result |
| --- | --- |
| 8 concurrent registrations → `GET /user` with each returned token | 6/8 tokens resolved to a different user |
| Batched registration (1 / 2 / 3 at a time) | 4/8, 5/8, 8/9 mismatches |
| Sequential registrations + logins | Immediate identity is correct; later registrations/logins rotate **other users'** tokens (earlier tokens become `401`) |

The backend effectively keeps one valid identity at a time. This is a public-environment defect, so no retry, sleep, timeout, worker change, or serialization workaround was added. WP4 owns the response to it.

### Other checks

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npx playwright test --list` | 9 tests in 6 files |
| `npx playwright test --reporter=list` | 9 passed (59.6 s vs WP2 47.2 s; public-environment variance, same assertions) |
| `npm run test:api` | 15 requests / 53 assertions, 0 failed |
| Visual snapshots | Unchanged; no `--update-snapshots` used |

## Assertion parity

- All 9 tests keep their assertions, URLs, timeouts, and test names unchanged.
- No test was added, removed, skipped, or renamed. The cleanup probe was temporary and is not part of the commit.
- Cleanup failures are logged, not asserted away; the `405` warnings remain exactly as before.

## Rule checklist

- [x] No assertion lowered, removed, or loosened.
- [x] No `test.skip`, `test.fixme`, `waitForTimeout`, sleep, or timeout increase.
- [x] No retry, snapshot, or visual threshold change.
- [x] Typecheck passes; typecheck was run before each commit.
- [x] No secrets committed; data is synthetic.
- [x] Before/after metrics recorded.
- [x] Decision note added.
- [x] No WP4 work pulled forward: defaults unchanged, no retries, worker counts only verified via CLI.

## Open questions

1. **Should the committed `fullyParallel` default flip in WP4 or WP6?** WP3 verified `--fully-parallel` at 1 and 2 workers; 4 workers is blocked by the backend identity behavior above, so any parallel default also needs the WP4 reliability plan (stable self-hosted instance, per-run identity coordination, or keeping one worker in CI).
2. **Should cleanup warnings additionally be attached to the test report** (e.g. annotations/attachments)? PRD only requires "best effort and logged"; the warning stays visible in the console and HTML report text today, but the artifacts are not structured.

## Follow-ups (not in this diff)

- WP4: worker counts, retries for CI only, `--repeat-each=10` at 4 workers, and the identity/token reliability plan.
- Optional: cleanup warnings as report attachments; splitting the UI create cleanup out of the test body.
