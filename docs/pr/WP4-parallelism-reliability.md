# WP4: Parallelism & Reliability

## Summary

This PR makes four-worker execution real rather than aspirational. It replaces
the shared public test target with a pinned, self-hosted RealWorld stack, flips
Playwright to `fullyParallel` with four workers, fixes the locator defect that
four workers exposed, and records 10 consecutive green runs with retries
disabled. CI now starts the same stack and no longer depends on repository
variables or the public demo.

The suite still has 9 tests and the same assertions, timeouts, snapshots, and
cleanup warnings. No test was skipped, removed, or loosened.

## Why

WP3 proved that the public backend cannot keep concurrent identities: 6/8
concurrent registration tokens resolved to a different user, and a later probe
measured 5/6 mismatches. Any four-worker run against that backend fails for an
environment reason. The owner chose the stable self-hosted option, so WP4 makes
the test target reproducible instead of hiding the defect with retries, sleeps,
or serial skips.

## What changed

### Self-hosted stack

- `docker-compose.yml`, `docker/api.Dockerfile`, `docker/web.Dockerfile`,
  `docker/nginx.conf`, `.dockerignore`
  - Angular frontend pinned to `realworld-apps/angular-realworld-example-app`
    `ea0dd032e0425142f684a870d6e233537baa6bb6` — the same application behind
    `demo.realworld.show`.
  - Nitro/Prisma API pinned to
    `realworld-apps/nitro-prisma-zod-realworld-example-app`
    `c8c66858a436a6e07f445fffe2253a65ff6dcb58`, with stateless JWT auth and a
    disposable SQLite database.
  - nginx serves the app on `8081` and proxies `/api` on the same origin, so the
    browser needs no CORS and the Angular app keeps a relative API URL.
  - Both services have health checks; `stack:up` waits for them.
- `docker/patches/nitro-unauthorized-update.patch`
  - Checks article ownership before body validation and returns `404` for a
    non-owner, matching the status the existing Postman assertions already
    expect from the target API. This is a documented test-infrastructure
    compatibility patch, not a product change and not an assertion change.
- `package.json` / `package-lock.json`
  - `stack:up`, `stack:down`, `test:local`, and `test:api:local`.
  - `cross-env` makes the local environment override cross-platform.

### Parallel configuration and locators

- `playwright.config.ts`
  - `fullyParallel: true`, `workers: 4`.
  - Local `retries: 0`; CI `retries: 1`.
  - Local trace `retain-on-failure`; CI trace `on-first-retry`.
- `pages/navbar.component.ts`
  - Every query is scoped to the `navigation` landmark.
  - Shared helpers: `newArticleLink`, `usernameLink`, `signInLink`,
    `signUpLink`.
  - Root cause: the username link also exists as an article author link, so the
    old unscoped query matched two elements under strict mode.
- `tests/ui/dashboard.spec.ts`, `tests/visual/editor.visual.spec.ts`
  - Use the scoped `NavBar` helpers instead of page-wide role queries.

### CI and docs

- `.github/workflows/tests.yml`
  - API job builds/starts only the API and runs Newman against
    `http://localhost:3000`.
  - Playwright job builds/starts both services and runs typecheck, UI, and
    cross-layer tests against `http://localhost:8081`.
  - Stack teardown runs in an `always()` step.
  - Removed repository-variable dependencies on `BASE_URL`, `API_BASE_URL`,
    `AUTH_EMAIL`, and `AUTH_PASSWORD`.
- `README.md`, `.env.example`
  - Self-hosted target, commands, port information, CI behavior, and limitations.
- `docs/decisions/WP4-parallelism-reliability.md`, `docs/metrics.md`,
  `docs/progress.md`
  - Decision record, before/after metrics, 1/2/4-worker benchmark, 10-run table,
    repeat probe, API identity probe, and tracker refresh.

## Evidence

### 10 consecutive four-worker runs, retries disabled

All 10 exited 0 with 9/9 tests. Wall time includes Node/browser startup.

| Run | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Wall (s) | 9.8 | 10.0 | 9.4 | 9.4 | 9.2 | 9.8 | 10.7 | 9.2 | 10.0 | 10.3 |
| Playwright (s) | 7.5 | 7.7 | 7.3 | 7.2 | 7.1 | 7.7 | 7.9 | 7.0 | 7.8 | 7.7 |
| Passed | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 |

A second independent 10-run batch after a Docker restart also passed **10/10**
(wall 16.8–22.9 s, Playwright 13.5–17.3 s). Both batches used `retries: 0`;
total **20/20 green**. Absolute times vary with Docker/host load.

### Worker benchmark

| Workers | Wall round 1 | Playwright round 1 | Wall round 2 | Playwright round 2 |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 15.4 s | 12.7 s | 13.9 s | 11.7 s |
| 2 | 9.1 s | 7.0 s | 9.5 s | 7.4 s |
| 4 | 9.0 s | 6.9 s | 9.0 s | 6.9 s |

### Other checks

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npx playwright test --list` | 9 tests in 6 files |
| `npm run test:local` | 9 passed at 4 workers |
| `npx playwright test tests/ui --repeat-each=10 --workers=4` | 41/41 passed (37.2 s warm; 1.0 min after restart) |
| `npm run test:api:local` | 15 requests / 53 assertions, 0 failed |
| Local concurrent identity probe | 0/6 mismatches (public was 5/6) |
| `waitForTimeout` in Playwright code | 0 |
| Visual snapshots | Unchanged; no `--update-snapshots` |

## Risks and trade-offs

- Docker adds cold-build time and needs network access to the pinned GitHub
  repositories. Local rebuilds are cached; CI builds once per job.
- The self-hosted backend is a pinned RealWorld implementation, not the public
  backend. The only observed contract mismatch is patched and documented.
- SQLite is adequate for this suite's write volume, not a production database.
- Pinned commits must be updated deliberately when the target changes.
- CI retries can hide a flake if the trace is ignored. The local acceptance is
  retry-free, and `on-first-retry` preserves the failed attempt for triage.

## CI status

CI has not run on this branch yet. The owner opens PRs through the GitHub UI, so
the first WP4 run will happen after this description is attached to the PR. The
workflow is written to build the self-hosted stack in both jobs; the PR run
result should be recorded in `docs/metrics.md` and `docs/progress.md` rather than
assumed.

## Rule checklist

- [x] One work package, one branch, one PR.
- [x] Branch based on updated `main` (`3fffa6f`), not on the WP3 branch.
- [x] No assertion lowered, removed, or loosened.
- [x] No `test.skip`, `test.fixme`, `waitForTimeout`, sleep, or timeout increase.
- [x] No snapshot update.
- [x] Local stability evidence uses retries disabled.
- [x] CI retry is CI-only, documented, and paired with first-retry tracing.
- [x] Typecheck passes; run before each commit.
- [x] No secrets committed; all test data is synthetic.
- [x] Before/after metrics and a decision note are included.
- [x] Postman changes limited to the self-hosted target; no assertion edits.
- [x] PR is opened by the owner; not merged by the agent.

## How to verify

```powershell
npm run stack:up
npm run typecheck
npm run test:local
npm run test:api:local
npx playwright test --workers=4 --reporter=line
npm run stack:down
```

## Open questions

1. Should the local API compatibility patch live in this repository (current
   choice, visible and pinned) or be replaced by a fork/upstream fix later?
2. Should WP5 reuse this stack for Linux visual baselines, or build a separate
   visual-only image to keep the baseline environment isolated?
