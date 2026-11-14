# Metrics

Measurements are local unless stated otherwise. This is the WP0 baseline for `main` at `c5ec4f2` (2026-10-13).

## Environment

| Item | Value |
| --- | --- |
| Repository | `https://github.com/ifhamm/QA-Assessment` |
| Audited revision | `c5ec4f22e4c037e1fc06243f9b2174f4cbeaea60` |
| OS | Windows 11 Home Single Language, 10.0.26200 |
| Node | v24.13.0 |
| npm | 11.6.2 |
| Playwright | 1.63.0 |
| TypeScript | 7.0.2 |
| k6 | v1.5.0 |
| Browser | Chromium 1243 (headless) |
| Workers | 1 |
| Retries | 0 |
| App / API | `https://demo.realworld.show` / `https://api.realworld.show/api` |

## Tests per layer

| Layer | Tool | Tests / cases | Runs in CI? |
| --- | --- | ---: | --- |
| API | Postman + Newman | 15 requests, 53 assertions | Yes |
| UI functional | Playwright | 3 execution tests | Yes |
| UI dashboard | Playwright | 1 execution test | Yes (from WP2) |
| Cross-layer | Playwright | 2 execution tests | Yes |
| Visual | Playwright | 2 execution tests | **No** |
| Setup project | Playwright | 1 setup test | Yes (dependency) |
| Performance | k6 | 1 scenario, 150 iterations, 300 checks | **No** |

Playwright discovery: **9 test executions** = 1 setup + 1 dashboard + 3 UI functional + 2 cross-layer + 2 visual. Excluding the setup infrastructure test, there are **8 user-facing Playwright tests**.

## Duration

Wall time includes Node/Playwright startup and browser launch. Playwright time is the reporter's summary.

| Scope | Command | Tests | Playwright time | Wall time | Result |
| --- | --- | ---: | ---: | ---: | --- |
| Full Playwright suite | `npx playwright test --reporter=list` | 9 | 1.3 min (~78 s) | 81.3 s | 9 passed |
| UI functional | `npm run test:ui -- --reporter=list` | 4 incl. setup | 29.6 s | 35.0 s | 4 passed |
| UI layer | `npx playwright test tests/ui --reporter=list` | 5 incl. setup + dashboard | 56.1 s | 60.7 s | 5 passed |
| Cross-layer | `npm run test:cross -- --reporter=list` | 3 incl. setup | 40.4 s | 43.9 s | 3 passed |
| Visual | `npm run test:visual -- --reporter=list` | 3 incl. setup | 33.9 s | 37.3 s | 3 passed |
| UI layer, 10 repeats | `npx playwright test tests/ui --repeat-each=10 --reporter=list` | 41 | 5.0 min | 313.1 s | 41 passed |
| API | `npm run test:api` | 15 requests / 53 assertions | 8.2 s | 22.8 s | 0 failed |
| k6 | `npm run test:perf` | 150 iterations / 300 checks | 40.1 s | 45.5 s | all thresholds pass |
| CI pipeline (latest) | GitHub Actions run `38359351107` | API + Playwright jobs | 39 s wall | 39 s | **failure** |

### Full-suite per-test durations (last local run)

| Test | Duration |
| --- | ---: |
| `auth.setup.ts` — authenticate via API | 8.0 s |
| `ui/dashboard.spec.ts` — opens the dashboard | 4.4 s |
| `cross-layer.spec.ts:13` — API create → UI verify | 15.7 s |
| `cross-layer.spec.ts:51` — UI update → API verify | 10.1 s |
| `ui/ui-functional.spec.ts:10` — login and create article | 11.9 s |
| `ui/ui-functional.spec.ts:56` — invalid credentials | 5.8 s |
| `ui/ui-functional.spec.ts:73` — unauthenticated editor redirect | 2.4 s |
| `visual/editor.visual.spec.ts` — editor baseline | 8.2 s |
| `visual/login.visual.spec.ts` — login baseline | 3.9 s |

## Flakiness

| Probe | Tests | Passed | Failed | Flaky |
| --- | ---: | ---: | ---: | ---: |
| UI layer `--repeat-each=10` | 41 | 41 | 0 | 0 observed |

Composition of the 41 executions: setup once + dashboard ×10 + UI functional ×30. With `retries: 0`, "flaky" here means "failed at least once during repetition"; pass-on-retry cannot occur.

No `waitForTimeout` calls were found. Two hardcoded 10 s waits remain in `cross-layer.spec.ts`.

## UI logins per run

"Successful UI login" = UI form submitted with valid credentials. "Submissions" also includes the invalid-credentials test.

| Scope | Successful UI logins | Invalid submissions | API login calls |
| --- | ---: | ---: | ---: |
| Full local Playwright run | 5 | 1 | 8 |
| Intended CI Playwright job (if setup worked) | 5 | 1 | 8 |
| UI layer `tests/ui`, one repeat | 2 | 1 | 3 |
| UI layer `tests/ui`, 10 repeats | 11 | 10 | 12 |

Breakdown:
- `auth.setup.ts`: 2 API login calls (configured synthetic credentials return 401; fallback user is registered and logged in) + 1 UI login. In CI it would run twice (once for `test:ui`, once for `test:cross`).
- `ui-functional.spec.ts:10`: 1 UI login + 1 cleanup API login.
- `ui-functional.spec.ts:56`: 1 invalid UI submission.
- `ui-functional.spec.ts:73`: none.
- `cross-layer.spec.ts:13`: 1 UI login + 2 API logins.
- `cross-layer.spec.ts:51`: 1 UI login + 3 API logins.
- `visual/editor.visual.spec.ts`: 1 UI login.
- `visual/login.visual.spec.ts`: none.
- `dashboard.spec.ts`: none (storage state).

## CI

### Latest run on `main`

| Item | Value |
| --- | --- |
| Run | [`41462400575`](https://github.com/ifhamm/QA-Assessment/actions/runs/41462400575) |
| Commit | `494d243` (WP4 merge) |
| Event | push |
| Conclusion | **success** |
| Overall wall | 2 m 04 s |
| API job | success, 1 m 57 s |
| Playwright job | success, 1 m 58 s |
| Typecheck step | success |
| UI tests step | success |
| Cross-layer step | success |
| HTML report artifact | uploaded |

The WP0 baseline run (`38359351107`, commit `c5ec4f2`) was **red** because `AUTH_EMAIL`/`AUTH_PASSWORD` were absent; that failure and the follow-up public-environment observations are kept in the WP0 section below for history.

The latest green run is the WP4 merge run above. The same tip also passed the PR
run and the branch push run before the merge; see the WP4 section below for
durations.

### What runs in CI

| Suite | In CI? |
| --- | --- |
| API (Newman) | Yes |
| Typecheck | Yes |
| UI functional (3) | Yes |
| Cross-layer (2) | Yes |
| Dashboard (1) | Yes (from WP2; `test:ui` runs `tests/ui`) |
| Visual (2) | **No** |
| k6 (1 scenario) | **No** |
| Merged report | No; HTML artifact only |
| JUnit / job summary | No |
| Trace artifact | CI traces on the first retry, inside the HTML report artifact |

Tests excluded from CI: visual and k6. The dashboard is included through
`test:ui`. The WP4 workflow also starts the self-hosted stack in both jobs.

## WP0 post-audit CI unblock (2026-10-29)

The owner approved a minimal unblock: synthetic `AUTH_EMAIL`/`AUTH_PASSWORD` in the Playwright job, `.env.example`, and the README environment note. No test behavior changed; `test:ui` still runs functional UI only and the dashboard remains out of CI.

### Local clean-branch verification

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | Pass (exit 0) |
| Full Playwright suite | `npx playwright test --reporter=list` | **9 passed**, 1.4 min reported / 88.0 s wall |
| Test discovery | `npx playwright test --list` | 9 tests in 6 files (unchanged) |

### Observed CI after the auth unblock

The runs below include temporary cross-layer experiments that were later reverted. They are evidence of the public environment's behavior, not of the final branch's test code.

| Run | Event | API job | Playwright job | Finding |
| --- | --- | --- | --- | --- |
| `40905357601` | push | pass | fail | Browser `GET /api/articles/...` 404 while `APIRequestContext` got 200 |
| `40906290088` | push | pass | fail | API wait succeeded; browser still got 404 |
| `40907097689` | push | pass | fail | Editor page saw persistent 404 for 20 s |
| `40908085383` | push | pass | pass | One successful pass; not proof of stability |
| `40908094021` | pull_request | pass | fail | Fresh cross-layer teardown login got 401 |
| `40908858571` | push | fail | pass | Newman article lifecycle got 404 |
| `40908872651` | pull_request | pass | fail | Dashboard's "New Article" link not visible within 5 s |

The auth-env blocker is gone: every listed Playwright job reached the setup project successfully. The remaining failures are read-after-write/auth-state inconsistencies in the shared public app/API. They are recorded as environment failures and are not hidden with retries, sleeps, or timeout increases.

## WP1 — Fixtures & Abstraction Boundaries (2026-10-31)

Branch `wp1/fixtures-abstraction-boundaries`, base `main` at `5364f30`. All fixtures are test-scoped; no worker-scoped state was introduced.

### Before / after

| Metric | Before (WP0) | After WP1 |
| --- | ---: | ---: |
| Playwright test executions | 9 | 9 |
| Full suite (Playwright time) | 1.2 min | 1.0 min |
| Cross-layer, incl. setup | 40.4 s | 29.4 s |
| UI functional, incl. setup | 29.6 s | 29.1 s |
| UI layer `--repeat-each=10` | 41/41, 5.0 min | 41/41, 3.9 min |
| API login calls per full run | 8 | 6 |
| Successful UI logins per full run | 5 + 1 invalid | 5 + 1 invalid |
| Expected `404` cleanup warnings | 1 per run | 0 |
| `405` user-deletion warnings | 1 per fixture test | 1 per fixture test |
| Literal `expect(` calls in migrated specs | 7 | 7 |

### Notes

- Cross-layer duration dropped because the tests no longer register and log in twice. The fixture reuses the registration token for article creation and logs in once for cleanup.
- **Token rotation:** the public API invalidates the previous token on every login. Cleanup therefore logs in again after the test's UI login. This is a correctness requirement, not a retry or a workaround.
- UI logins are unchanged. Removing them is WP2.
- The probe uses `tests/ui` (dashboard + 3 functional tests) to match the WP0 baseline.
- No assertion, timeout, retry, snapshot, or threshold changed.

## WP2 — Reuse Auth State (2026-10-31)

Branch `wp2/reuse-auth-state`, base `main` at `e74a82d`. Local runs: Windows 11, Node 24.13.0, Playwright 1.63.0, 1 worker, retries 0.

### Before / after

| Metric | Before (WP1) | After WP2 |
| --- | ---: | ---: |
| Playwright test executions | 9 | 9 |
| Full suite (Playwright time) | 1.0 min | 47.2 s |
| UI functional (`test:ui:functional`) | 29.1 s | 21.1 s |
| UI all (`test:ui`) | n/a (functional only) | 27.0 s (functional + dashboard) |
| Cross-layer | 29.4 s | 20.6 s |
| Visual | not recorded in WP1 (WP0: 33.9 s) | 15.7 s |
| UI `--repeat-each=10` | 41/41, 3.9 min | 41/41, 3.8 min |
| Successful UI logins per full run | 5 + 1 invalid | 1 + 1 invalid |
| Setup UI logins | 1 | 0 |
| Successful API login calls per full run | 6 | 4 (5 attempts; one configured credential is rejected) |
| Expected `405` user-deletion warnings | 1 per fixture test | 4 per full run |
| Dashboard in CI | No | Yes |
| `test:ui` scope | `ui-functional.spec.ts` only | `tests/ui` (functional + dashboard) |

### Notes

- UI login locations after WP2: `ui-functional.spec.ts:19` (explicit login-and-create test) and `ui-functional.spec.ts:59` (invalid credentials). Setup, cross-layer, and visual editor no longer submit the login form.
- The API login count is a code-path count. With `AUTH_*` present but invalid, setup makes one rejected login attempt plus one successful fallback login. With `AUTH_*` absent it makes one successful fallback login. Cross-layer and UI create still log in once for cleanup because login rotates the token.
- The `405` warnings are expected: cross-layer ×2, UI create ×1, visual editor ×1. WP3 owns cleanup semantics.
- The full suite had no `404` cleanup warning. The 41-run repeat probe produced one expected `404` on UI article cleanup (public API read-after-delete inconsistency); the test still passed.
- The visual snapshot was not changed; no `--update-snapshots` was used.

### Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npx playwright test --list` | 9 tests in 6 files |
| `npx playwright test --reporter=list` | 9 passed (47.2 s) |
| `npm run test:ui` | 5 passed (27.0 s; setup + dashboard + 3 functional) |
| `npm run test:ui:functional` | 4 passed (21.1 s) |
| `npm run test:cross` | 3 passed (20.6 s) |
| `npm run test:visual` | 3 passed (15.7 s) |
| `npx playwright test tests/ui --repeat-each=10` | 41 passed (3.8 min) |
| `npm run test:api` | 15 requests / 53 assertions, 0 failed (6.5 s) |
| Absent `AUTH_EMAIL`/`AUTH_PASSWORD` setup run | 1 passed; session-local user created |
| `git check-ignore playwright/.auth/user.json` | ignored |

CI evidence will be added after the PR run. The public environment remains intermittent; failures are recorded and rerun manually, not hidden.

## WP3 — Test Data Architecture (2026-11-01)

Branch `wp3/test-data-architecture`, base `main` at `90e66ec`. Local runs: Windows 11, Node 24.13.0, Playwright 1.63.0. Defaults untouched: `fullyParallel: false`, `workers: 1`, `retries: 0`; the parallel evidence below uses CLI overrides (WP4 owns the defaults).

### Before / after

| Metric | Before (WP2) | After WP3 |
| --- | ---: | ---: |
| Playwright test executions | 9 | 9 |
| Serial full suite | 9 passed, 47.2 s | 9 passed, 59.6 s (public-environment variance; same assertions) |
| Tests passing alone (`--grep`) | not established | **9/9 PASS** |
| `--fully-parallel --workers=1` | n/a | 9 passed (1.0 min) |
| `--fully-parallel --workers=2` | n/a | 9 passed (59.4 s) |
| `--fully-parallel --workers=4` | n/a | 7/9 and 8/9 across 2 runs; failures traced to the public API's identity behavior (below), not to data collisions |
| UI `tests/ui --repeat-each=10` | 41/41, 3.8 min | 41/41, 5.2 min |
| Successful UI logins per full run | 1 + 1 invalid | 1 + 1 invalid (unchanged) |
| Expected `405` user-deletion warnings | 4 per full run | 4 per full run |
| Sites generating synthetic users inline | 3 (`user` fixture, `auth.setup.ts`, `ui-functional.spec.ts`) | **0** — all use `syntheticUser()` |
| Hard-coded emails/usernames/slugs that could collide | 0 | 0 |
| Confirmed data collisions | n/a | 0 |
| `fullyParallel` default | `false` | `false` (unchanged; acceptance met via CLI override) |

### Isolation evidence

| Probe | Result |
| --- | --- |
| 9 single-test runs with `--grep` | All pass; setup dependency runs each time |
| `--fully-parallel --workers=1` | 9/9 in 1.0 min |
| `--fully-parallel --workers=2` | 9/9 in 59.4 s |
| `--fully-parallel --workers=4`, run 1 | 7/9; both cross-layer tests saw another run's identity |
| `--fully-parallel --workers=4`, run 2 | 8/9; cross-layer test 1 saw the setup user's identity |
| `tests/ui --repeat-each=10` | 41/41; no article `404` cleanup warning |
| Cleanup-on-failure probe (temporary spec, removed before commit) | A deliberately failing test still ran teardown; the fixture user deletion was attempted (`405` warning) and a later API read of the article returned `404`, confirming deletion |

### API identity probe (evidence for the 4-worker failures)

Run with plain `fetch` against `https://api.realworld.show/api`, outside the test suite:

| Probe | Result |
| --- | --- |
| 8 concurrent registrations → `GET /user` with each returned token | **6/8 tokens resolved to a different user** |
| Batched registration (1, 2, 3 at a time) | 4/8, 5/8, and 8/9 mismatches respectively: higher concurrency is worse, but not required for failure |
| Sequential register → immediate token check; check again after more registrations/logins | Immediate identity is correct; after later registrations/logins most earlier tokens are `401` — registrations and logins rotate **other users'** tokens |

Conclusion: the backend effectively keeps one valid identity at a time. Any test that registers or logs in can invalidate another test's token, which is why parallel runs fail and why the failing tests showed a different username than their own. WP3's per-test/per-worker data (users, articles, slugs) is unique and did not collide; the failures are a server-side identity defect. WP4 owns the response.

### Data layout

| Item | Before | After |
| --- | --- | --- |
| Identifier format | `Date.now()` + 6 random characters | `<runId>-w<workerIndex>-<counter>` (`runId` = 8 chars of `crypto.randomUUID()` per process) |
| Uniqueness guarantee | "Almost certainly unique" | Random run id separates processes; monotonic counter separates calls; uniqueness does not depend on `workerIndex` being passed |
| Logging of cleanup failures | API-layer warnings only, teardown errors could replace the test failure | `bestEffortCleanup()` catches, labels, logs, and never throws |

### Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npx playwright test --list` | 9 tests in 6 files |
| `npx playwright test --reporter=list` | 9 passed (59.6 s) |
| 9 × `--grep` single-test runs | 9/9 PASS |
| `npx playwright test --fully-parallel --workers=1` | 9 passed (1.0 min) |
| `npx playwright test --fully-parallel --workers=2` | 9 passed (59.4 s) |
| `npx playwright test tests/ui --repeat-each=10` | 41/41 passed (5.2 min) |
| Cleanup-on-failure probe | Test failed by design; article deleted (later read: `404`); user deletion attempted (`405` warning); probe file deleted before commit |
| `npm run test:api` | 15 requests / 53 assertions, 0 failed (6.2 s) |
| Snapshots | Unchanged; no `--update-snapshots` used |

### CI after merge

| Run | Event | API job | Playwright job | Result |
| --- | --- | --- | --- | --- |
| [`41305629458`](https://github.com/ifhamm/QA-Assessment/actions/runs/41305629458) | pull_request | fail (10 s) | fail (58 s): UI passed, cross-layer failed | PR run red; consistent with the public-environment behavior, recorded as-is |
| [`41305646205`](https://github.com/ifhamm/QA-Assessment/actions/runs/41305646205) | push (`main`, `3fffa6f`) | pass (14 s) | pass (52 s) | **green**, both jobs; overall 56 s |

The PR run is the evidence the handover asked for, and it is red. It is not hidden: the same commit tree passed both jobs on the merged `main` push run moments later, which points to the environment rather than the diff. No retry was added to make it green. WP4 owns consolidating this reliability work.

## WP4 — Parallelism & Reliability (2026-11-02)

Branch `wp4/parallelism-reliability`, base `main` at `3fffa6f` (WP3 merge). Local
runs: Windows 11, Node 24.13.0, Playwright 1.63.0, Docker Desktop with Compose
v2. The target is the pinned self-hosted stack described in
[`docs/decisions/WP4-parallelism-reliability.md`](decisions/WP4-parallelism-reliability.md).

### Before / after

| Metric | Before (WP3) | After WP4 |
| --- | --- | --- |
| Test target | Shared public demo/API | Self-hosted pinned Angular + Nitro stack |
| `fullyParallel` | `false` | **`true`** |
| Workers | `1` | **`4`** |
| Retries | `0` | `0` locally; `1` in CI |
| Trace | `retain-on-failure` | Local `retain-on-failure`; CI `on-first-retry` |
| Full suite at 4 workers | 7/9 and 8/9 (public identity defect) | **20/20 runs green across two batches, 9/9 tests each** |
| 4-worker full-suite Playwright time | n/a (runs failed) | 7.0–7.9 s warm; 13.5–17.3 s after Docker restart |
| UI `--repeat-each=10` | 41/41, 5.2 min | **41/41, 37.2 s warm; 1.0 min after restart** |
| Concurrent registration identity probe | 5/6 mismatches (public) | **0/6 mismatches** (local) |
| `waitForTimeout` in Playwright code | 0 | **0** (unchanged) |
| API suite target | Public API | Local API, 15 requests / 53 assertions, 0 failed |

### Worker benchmark

Two rounds after the stack was warm; full suite, `fullyParallel: true`. Wall time
includes Node and browser startup; the Playwright value is the reporter's test
time.

| Workers | Wall round 1 | Playwright round 1 | Wall round 2 | Playwright round 2 |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 15.4 s | 12.7 s | 13.9 s | 11.7 s |
| 2 | 9.1 s | 7.0 s | 9.5 s | 7.4 s |
| 4 | 9.0 s | 6.9 s | 9.0 s | 6.9 s |

The suite is small, so fixed setup/browser cost dominates the wall time. On test
time, four workers roughly halve the one-worker duration.

### 10 consecutive 4-worker runs (retries disabled)

All 10 runs exited 0 with 9/9 tests. `CI` was unset, so the config used
`retries: 0`.

| Run | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Wall (s) | 9.8 | 10.0 | 9.4 | 9.4 | 9.2 | 9.8 | 10.7 | 9.2 | 10.0 | 10.3 |
| Playwright (s) | 7.5 | 7.7 | 7.3 | 7.2 | 7.1 | 7.7 | 7.9 | 7.0 | 7.8 | 7.7 |
| Passed | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 |

A second independent batch after Docker Desktop restarted (same code, fresh
containers) also passed **10/10**: wall 16.8–22.9 s, Playwright 13.5–17.3 s.
Absolute times vary with Docker/host load; both batches used `retries: 0`.
Total across both batches: **20/20 green**.

### Repeat probe

`npx playwright test tests/ui --repeat-each=10 --workers=4`:
**41/41 passed** in 37.2 s (39.6 s wall). A second probe after the Docker restart
also passed 41/41 in 1.0 min. The WP3 one-worker equivalent took 5.2 min.

### Local API identity probe

6 concurrent registrations, each followed by `GET /user` with its own token:
**0/6 mismatches**. The public API probe on 2026-11-01 was 5/6 mismatches, and
WP3 recorded 6/8 mismatches for an 8-registration probe. This is the defect the
self-hosted target removes.

### Locator audit and flake found

The first 4-worker run exposed a strict-mode violation: `NavBar` searched the
whole page for the username link, which also matched the article author link on
article pages. The dashboard and visual editor tests had the same unscoped
pattern. `NavBar` now scopes every query to the `navigation` landmark and exposes
shared link helpers; the dashboard and visual tests use them. This was a
root-cause locator fix, not a retry, sleep, timeout increase, or assertion
change.

`waitForTimeout` count in Playwright code: **0**. The only `sleep(1)` in the
repository is k6 load-test pacing, not a UI wait.

### Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npx playwright test --list` | 9 tests in 6 files |
| `npm run test:local` | 9 passed (4 workers) |
| 10 × 4-worker runs (batch 1) | **10/10 green**, 9/9 each |
| 10 × 4-worker runs (batch 2, after Docker restart) | **10/10 green**, 9/9 each |
| `npx playwright test tests/ui --repeat-each=10 --workers=4` | 41/41 passed (37.2 s warm; 1.0 min after restart) |
| `npm run test:api:local` | 15 requests / 53 assertions, 0 failed |
| `waitForTimeout` in Playwright code | 0 |

### CI

The WP4 workflow builds the self-hosted stack in both jobs and no longer reads
`BASE_URL`, `API_BASE_URL`, `AUTH_EMAIL`, or `AUTH_PASSWORD` from repository
variables. Local retries are 0; CI uses one retry with `on-first-retry` tracing.
The local 10-run evidence above is retry-free and is the stability claim.

PR [#5](https://github.com/ifhamm/QA-Assessment/pull/5) merged the branch as
`494d243` on 2026-11-02. All three runs on the final tree were green on the first
attempt (`run_attempt: 1`), so no CI retry was consumed:

| Run | Event | Commit | Conclusion | Wall | API job | Playwright job |
| --- | --- | --- | --- | ---: | ---: | ---: |
| [`41462038159`](https://github.com/ifhamm/QA-Assessment/actions/runs/41462038159) | push (branch) | `3931d12` | success | 1 m 49 s | 1 m 08 s | 1 m 44 s |
| [`41462371220`](https://github.com/ifhamm/QA-Assessment/actions/runs/41462371220) | pull_request | `3931d12` | success | 2 m 04 s | 1 m 17 s | 1 m 59 s |
| [`41462400575`](https://github.com/ifhamm/QA-Assessment/actions/runs/41462400575) | push (`main`) | `494d243` | success | 2 m 04 s | 1 m 57 s | 1 m 58 s |

Stack startup dominates CI time: 61-66 s for the Playwright job and 46-52 s for
the API job, versus 1-5 s for the test steps. Both stay well inside the 20/25
minute job timeouts, and the HTML report is attached to run `41462400575` as the
`playwright-report` artifact.

## WP5 - Visual Testing Done Right (2026-11-02)

Branch `wp5/visual-linux-ci`, based on `main` at `494d243` plus the WP4 docs
follow-up. Local host: Windows 11, Node 24.13.0, Docker Desktop 29.2.0. Visual
rendering happens only in `mcr.microsoft.com/playwright:v1.63.0-noble`, matching
the `@playwright/test` `1.63.0` in `package-lock.json`.

### Before / after

| Metric | Before (WP4) | After WP5 |
| --- | --- | --- |
| Visual rendering environment | Windows host | Pinned Playwright Linux image |
| Baselines | `*-chromium-win32.png` (2) | `*-visual-linux.png` (2) |
| Visual tests in CI | No | Yes, separate `Visual Tests` job |
| Default local run | 9 tests (visual included) | 7 host tests; 2 visual via container |
| Failure artifacts | None for visual | expected / actual / diff via `visual-diffs` |
| Screenshot inputs | Host timezone, locale, scheme | UTC, `en-US`, light |
| Animations | Playwright default | Explicit `animations: "disabled"` |
| Diff thresholds | Playwright defaults | Unchanged defaults |

### Local evidence

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npx playwright test --list` | 9 tests in 6 files (7 host + 2 visual) |
| `npm run test:local` | 7 passed (19.6 s, 4 workers) |
| `npm run test:visual:linux` | 2 passed (7.4 s) |
| `--project=visual --repeat-each=5` | 10/10 passed (23.4 s) |
| Baseline dimensions | 1280x720 for both screenshots |
| Windows baselines | Removed (`*-chromium-win32.png`) |

### CI

| Run | Event | Commit | Conclusion | Wall | API job | Playwright job | Visual job |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: |
| [`41466040923`](https://github.com/ifhamm/QA-Assessment/actions/runs/41466040923) | push (branch) | `7045feb` | success | 2 m 24 s | 1 m 08 s | 2 m 14 s | 1 m 50 s |
| [`41466501007`](https://github.com/ifhamm/QA-Assessment/actions/runs/41466501007) | push (experiment) | `7254cb3` | failure (expected) | 2 m 42 s | 1 m 08 s | 2 m 42 s | 1 m 49 s |
| [`41467922061`](https://github.com/ifhamm/QA-Assessment/actions/runs/41467922061) | push (branch, final) | `d85fa39` | success | 2 m 24 s | 1 m 40 s | 2 m 20 s | 1 m 50 s |
| [`41468501944`](https://github.com/ifhamm/QA-Assessment/actions/runs/41468501944) | push (branch, docs) | `873e837` | success | 2 m 20 s | 1 m 09 s | 2 m 16 s | 1 m 46 s |
| [`41469698058`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469698058) | pull_request | `984cd61` | success | 1 m 51 s | 1 m 22 s | 1 m 45 s | 1 m 47 s |
| [`41469719183`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469719183) | push (`main`) | `068f56a` | success | 2 m 09 s | 1 m 14 s | 1 m 55 s | 1 m 49 s |

The first run is the WP5 acceptance run: the `Visual Tests` job logged
`2 passed (1.9s)` inside the Playwright image, and the Playwright job logged
`5 passed` + `3 passed` with no `Retry #` line. The API job was green as well.
The final docs-only commit `d85fa39` was green again with the same three jobs
(Visual 1 m 50 s), so the evidence commit itself is covered. The subsequent
docs-only commit `873e837` was also green (Visual 1 m 46 s). WP5 merged as
`068f56a` via PR [#7](https://github.com/ifhamm/QA-Assessment/pull/7); the PR
and post-merge `main` runs are both green.

The experiment run is the intentional-failure proof. Only the `Visual Tests`
job failed; API and Playwright stayed green. The job uploaded the
`visual-diffs` artifact (1.2 MB) containing:

- `login-page-expected.png` — the committed Linux baseline;
- `login-page-actual.png` — the red-background render;
- `login-page-diff.png` — the pixel diff.

The two images are committed as
[`wp5-intentional-failure-diff.png`](evidence/wp5-intentional-failure-diff.png)
and
[`wp5-intentional-failure-actual.png`](evidence/wp5-intentional-failure-actual.png).
The experiment branch `experiment/wp5-visual-failure` was deleted after the
artifact was captured; the run link above remains the durable evidence.

## WP6 - Staged CI Pipeline & Sharding (2026-11-13)

### Before / after

| Aspect | Before WP6 | After WP6 |
| --- | --- | --- |
| CI jobs | 3 flat jobs | static, API, UI smoke, sharded UI regression, visual, merged report |
| Tags | none | `@smoke` / `@regression`, enforced by `npm run check:tags` |
| Sharding | none | opt-in matrix (`workflow_dispatch`), default 1 shard |
| Report | separate HTML run folders; the second Playwright invocation overwrote the first | one merged HTML report from blob artifacts |
| Lint | none | ESLint 10 + `typescript-eslint` 8 |
| Browser cache | none | `~/.cache/ms-playwright` keyed by lockfile |
| CI wall / runner-minutes | 2 m 09 s / 4.9 | 3 m 17 s / 8.7 (1 shard); 3 m 07 s / 12.1 (3 shards) |

### Local comparison (warm stack, retries 0)

Five consecutive full runs at 4 workers, all green:

| Run | Wall | Playwright |
| ---: | ---: | ---: |
| 1 | 7.9 s | 6.3 s |
| 2 | 7.1 s | 5.8 s |
| 3 | 7.0 s | 5.8 s |
| 4 | 7.1 s | 5.9 s |
| 5 | 7.2 s | 5.8 s |

| Workers | Runs | Wall | Playwright |
| ---: | --- | ---: | ---: |
| 1 | 3 | 9.1–9.4 s | 7.9–8.1 s |
| 4 | 5 | 7.0–7.9 s | 5.8–6.3 s |

Three sequential regression shards (3 tests, not a full-suite comparison):
sum wall 24.5–25.4 s, sum Playwright 20.9–22.1 s. Smoke stage alone: 15.2–15.7 s
wall, 14.0–14.6 s Playwright, 4 passed. Visual: 2 passed in 3.3 s.

### CI

| Configuration | Run | Wall | Runner-minutes | Merged report |
| --- | --- | ---: | ---: | --- |
| Flat 3 jobs, 4 workers (pre-WP6 `main`) | [`41469719183`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469719183) | 2 m 09 s | 4.9 | No |
| Staged, 1 shard | [`43435185236`](https://github.com/ifhamm/QA-Assessment/actions/runs/43435185236) | 3 m 17 s | 8.7 | 203 KB |
| Staged, 3 shards | [`43435791291`](https://github.com/ifhamm/QA-Assessment/actions/runs/43435791291) | 3 m 07 s | 12.1 | Yes |

Wall time includes hosted-runner queueing and varies between otherwise identical
runs: the final docs-only run
[`43437504829`](https://github.com/ifhamm/QA-Assessment/actions/runs/43437504829)
waited 160 s before its first job started, so its end-to-end wall was 5 m 23 s
while its job durations summed to 7.5 runner-minutes. Use job durations and
runner-minutes for comparisons; the evidence runs above had 3–4 s of queue
before their first job. The final run still produced the 203 KB merged report
and all jobs were green.

The 3-shard run came from a temporary commit that defaulted the matrix to
three shards and was reverted immediately. Intermediate run
[`43434297464`](https://github.com/ifhamm/QA-Assessment/actions/runs/43434297464)
failed the `Merged Report` job: blob files are named
`report-<project>-<shard>.zip`, so the flatten step found nothing and the
merge was skipped. An earlier run (`43433653244`) uploaded no `merged-report`
for the same reason. The flatten step now copies every `*.zip`, uses
`playwright.merge.config.ts` so the container's `/work/tests` blob merges with
host blobs, and a `Verify merged report` step fails the job when
`playwright-report/index.html` is missing.

**Conclusion:** at 7 tests, sharding pays in neither wall time nor
runner-minutes. Three shards are 10 s faster in wall time than one shard but
cost 3.4 more runner-minutes. The staged split itself costs 3.8 more
runner-minutes and 68 s more wall time than the flat workflow because every
stage rebuilds the stack. Keep the stages for isolation and future growth,
keep one shard by default, and enable sharding when the regression stage
outgrows shard startup.

## WP7 - Reporting & Quality Gates (2026-11-14)

Branch `wp7/reporting-quality-gates`, base `main` at `851afbd` (WP6 merge).
Local runs: Windows 11, Node 24.13.0, Playwright 1.63.0.

### Before / after

| Aspect | Before WP7 | After WP7 |
| --- | --- | --- |
| Report formats | merged HTML + blobs | merged HTML + JUnit + JSON, per stage and merged |
| Failure discovery | open each job log | one job summary with counts, failing tests, stage, error, trace availability |
| API results in reporting | separate job log only | Newman JSON in the summary and `api-results` artifact |
| Gate enforcement | implicit in job failure; report job green over red stages | `Quality Gate` reads every `needs.*.result`; missing data fails |
| Flaky visibility | retry visible in logs only | summary table + `::warning` annotation, still non-blocking |
| Written policy | none | `docs/quality-gates.md` |
| Extra CI cost | one Node-only gate job (8 s measured) plus small JUnit/JSON uploads |

### Local verification

Parser fixtures, not application tests: a four-test probe produced 1 passed,
1 flaky (failed attempt 1, passed attempt 2), 1 skipped, 1 failed, plus a
synthetic Newman report with one failed request.

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run check:tags` | 3 `@smoke`, 3 `@regression`, 2 visual |
| `merge-reports` with HTML/JUnit/JSON | `index.html`, `merged.json`, `merged-junit.xml` produced |
| Summary, failing fixture | exit 1; failure table, flaky table, Newman failure, gate reasons correct |
| Summary, clean fixture | exit 0; verdict pass |
| Summary, missing inputs | exit 1 with explicit reasons |
| Workflow YAML | parses; 8 jobs; gate env and artifact names verified |

### CI

| Evidence | Run | Result |
| --- | --- | --- |
| Green, 1 shard | [`43552638345`](https://github.com/ifhamm/QA-Assessment/actions/runs/43552638345) | success, 2 m 44 s wall, 439 s summed job time, `Quality Gate` 8 s; summary 9 passed, 0 failed, 0 flaky; 15 requests / 53 assertions |
| Intentional smoke failure | [`43553098095`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553098095) | `UI Smoke` and `Quality Gate` failure; `Merged Report` success, proving the WP6 hole is now caught; summary names the test at `tests/ui/wp7-intentional-failure.spec.ts:6`, stage `smoke`, 2 attempts, trace yes; verdict blocked |
| Flaky retry | [`43553398227`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553398227) | success with `##[warning]` annotation; flaky row at `tests/ui/wp7-flaky-probe.spec.ts:5`, stage `regression-1`, 2 attempts; verdict pass with warnings |
| Post-revert green | [`43553744785`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553744785) | success, 2 m 43 s wall, all 8 jobs |

The probe files were added in one commit and reverted immediately; they are not in the branch. Cost comparison: the WP6 post-merge `main` run summed 480 s of job time, this WP7 run 439 s. The gate job adds 8 s; the difference is run-to-run variance in the stack builds, not a saving. Billable minutes are dominated by the per-stage Docker builds, as in WP6.

## Reporting quality

| Metric | Baseline |
| --- | --- |
| Reporters | Local `html`; CI `blob` + `line` + `junit` + `json`; merged `html` + `list` + `junit` + `json` |
| Local HTML | `playwright-report/index.html` |
| Trace | Local `retain-on-failure`; CI `on-first-retry` |
| Screenshot | `only-on-failure` |
| Retries | 0 locally; 1 in CI |
| Workers | 4, `fullyParallel: true` |
| Video | No |
| JUnit / JSON | Yes (WP7); per stage and merged |
| Job summary | Yes (WP7); `Quality Gate` job |
| CI artifact | `merged-report`, `merged-results`, `results-*`, `api-results`, `summary`, traces per failed stage, `visual-diffs` on visual failure; 7-day retention |

**Qualitative:** better than a bare console. A failure leaves a screenshot,
error context, and (on failure) a trace. The merged report contains every stage
in one artifact, including the container-rendered visual tests, and `Quality
Gate` turns the run into one summary: counts, failing tests with stage,
`file:line`, first error and trace availability, plus the Newman totals. Flaky
tests are listed and annotated instead of disappearing into a green retry.
JUnit/JSON artifacts cover CI consumers that cannot read a blob. The remaining
gap is link depth: the summary points at artifacts, not at a hosted trace URL,
so triage is summary → artifact → report → trace rather than a single deep link.

## Tooling health

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | Pass (exit 0) |
| Test discovery | `npx playwright test --list` | 9 tests in 6 files |
| Default test script | `npm test` | Present; runs the 7 host tests and excludes the container-only visual project |
| Self-hosted test script | `npm run test:local` | Present; overrides target URLs and auth env, 7 host tests |
| API script | `npm run test:api` | Present (public demo) |
| Local API script | `npm run test:api:local` | Present (self-hosted `localhost:3000`) |
| Local API + JSON report | `npm run test:api:local:ci` | Present; adds Newman JSON for the summary |
| Stack scripts | `npm run stack:up`, `npm run stack:down` | Present; `down` removes the disposable SQLite data |
| UI script | `npm run test:ui` | Present; runs `tests/ui` (functional + dashboard). `test:ui:functional` runs functional only. |
| Cross-layer script | `npm run test:cross` | Present |
| Visual script | `npm run test:visual` | Present; runs the 2 visual tests in the pinned Playwright container |
| Smoke script | `npm run test:smoke` | Present; runs the 3 `@smoke` host tests plus setup |
| Regression script | `npm run test:regression` | Present; runs the 3 `@regression` host tests with `--no-deps` |
| Tag check | `npm run check:tags` | Pass; 3 `@smoke`, 3 `@regression`, 2 visual |
| Merged report | `npm run report:merge` | Present; merges blob reports with `playwright.merge.config.ts` (HTML + JUnit + JSON) |
| CI summary | `npm run ci:summary` | Present; builds the job summary and evaluates gates locally |
| Performance script | `cd performance && npm run test:perf` | Present |
| Lint | `npm run lint` | Pass (exit 0); ESLint 10 + `typescript-eslint` 8 |

## Reference

- Detailed findings: [`docs/audit.md`](audit.md)
- WP0 decision note: [`docs/decisions/WP0-baseline-audit.md`](decisions/WP0-baseline-audit.md)
- WP4 decision note: [`docs/decisions/WP4-parallelism-reliability.md`](decisions/WP4-parallelism-reliability.md)
- WP5 decision note: [`docs/decisions/WP5-visual-linux-ci.md`](decisions/WP5-visual-linux-ci.md)
- WP6 decision note: [`docs/decisions/WP6-staged-ci-sharding.md`](decisions/WP6-staged-ci-sharding.md)
- WP7 decision note: [`docs/decisions/WP7-reporting-quality-gates.md`](decisions/WP7-reporting-quality-gates.md)
- Quality gate policy: [`docs/quality-gates.md`](quality-gates.md)
