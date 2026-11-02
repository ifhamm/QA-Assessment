# WP4 — Parallelism & Reliability

- **Date:** 2026-11-02
- **Branch:** `wp4/parallelism-reliability`
- **Base:** `main` at `3fffa6f` (WP3 merged)
- **Owner decision:** self-host the RealWorld stack for CI and local parallel runs.

## Context

WP3 made every test own its data, but 4-worker runs still failed. A direct API
probe showed that the shared public backend cannot keep concurrent identities:

- 8 concurrent registrations: **6/8** tokens resolved to a different user.
- A fresh probe on 2026-11-01: **5/6** concurrent registrations resolved to the
  first registration's identity.
- Sequential registrations/logins invalidated earlier tokens, even tokens
  belonging to other users.

WP3 correctly stopped at that boundary: this is a server-side identity defect,
not a data collision. WP4 therefore had to choose a stable target. The written
acceptance — 10 consecutive green runs with 4 workers and no retries — cannot be
met against `demo.realworld.show` without hiding the defect.

## Options considered

| Option | Assessment |
| --- | --- |
| Self-host the same UI and a spec-compliant API — **chosen** | Removes the shared global identity, keeps the suite's assertions and test intent, and gives CI a reproducible target. Adds Docker build time and a small amount of infrastructure. |
| Coordinate one identity per run | Would still share mutable auth state between tests and does not fix the backend's global token behavior. Conflicts with WP3's per-test ownership. Rejected. |
| Keep one worker and formally rescope WP4 | Honest, but gives up the PRD's parallel acceptance and leaves the suite slower. Rejected by the owner. |

## Decision

### Stack

`docker-compose.yml` runs two services:

- **api** — `realworld-apps/nitro-prisma-zod-realworld-example-app` pinned at
  `c8c66858a436a6e07f445fffe2253a65ff6dcb58`. Nitro + Prisma + SQLite, with
  stateless JWT auth. The database lives inside the disposable container, so
  `docker compose down -v` gives the next run a clean database.
- **web** — `realworld-apps/angular-realworld-example-app` pinned at
  `ea0dd032e0425142f684a870d6e233537baa6bb6`. This is the same Angular frontend
  that powers `demo.realworld.show`, including the RealWorld theme submodule.

The frontend's interceptor normally hardcodes `https://api.realworld.show/api`.
The Docker build replaces only that origin with the relative `/api` at the
pinned commit. nginx serves the Angular app and proxies `/api/` to the API
container, so the browser never needs CORS and the application's routing still
works on deep links.

Ports: web on `8081`, API on `3000`. `8081` was chosen because `8080` was already
occupied on the development machine; the port is configuration, not a product
assumption.

### API contract patch

The existing Postman collection asserts `404` when a non-owner tries to update
an article. The Nitro clone checks the request body first and returns `422` for
an empty title before it checks ownership. The public target returns `404`
because it resolves the article for the current user first.

`docker/patches/nitro-unauthorized-update.patch` reorders that route: a missing
article or a non-owner returns `404`, then the body is validated. This is a
test-infrastructure compatibility patch, not a change to the product under test,
and it is pinned to the backend commit. No assertion, expected status, or test
data was changed.

`DELETE /user` still returns `405`, so the existing expected cleanup warning is
unchanged.

### Playwright configuration

- `fullyParallel: true`
- `workers: 4`
- `retries: 0` locally, `1` in CI (`CI` is set by GitHub Actions)
- trace: `retain-on-failure` locally, `on-first-retry` in CI
- CI retry is deliberately small and never used to claim local stability; the
  10-run probe below runs with retries disabled.

### CI

Both jobs now use the self-hosted stack:

- **API job** starts only the API container and runs Newman through
  `http://localhost:3000`.
- **Playwright job** starts both containers, runs typecheck, UI tests, and
  cross-layer tests against `http://localhost:8081`.
- The workflow no longer reads `BASE_URL`, `API_BASE_URL`, `AUTH_EMAIL`, or
  `AUTH_PASSWORD` from repository variables. The setup project creates a
  session-local user.
- The stack is removed with `docker compose down -v` in an `always()` step.

### Locator audit

The 4-worker run found a real latent defect: `NavBar.expectLoggedIn()` searched
the whole page for the username link. On an article page the author name is also
a link, so Playwright strict mode matched two elements. The dashboard and visual
tests used similar unscoped queries.

`NavBar` now scopes every query to the `navigation` landmark and exposes
`newArticleLink()`, `usernameLink()`, `signInLink()`, and `signUpLink()`. The
dashboard and visual editor tests use those helpers. This is a root-cause fix,
not a timeout or retry.

The remaining CSS locators (`.article-content`, `.error-messages`) target stable
RealWorld markup that has no semantic role or label. They are still
auto-waiting locators and are not a source of arbitrary waits.

- `waitForTimeout` occurrences in Playwright code: **0**.
- The only `sleep(1)` is k6 load-test pacing, not a UI wait.
- All assertions are web-first (`expect(locator)...`); no manual polling.

## Trade-offs

- Docker builds add time and require network access to the pinned GitHub
  repositories. Local rebuilds are cached; CI starts with a cold build.
- The self-hosted backend is not byte-identical to the public backend. It is
  selected to match the tested RealWorld contract, and the one observed
  difference is patched and documented above.
- SQLite is sufficient for this suite's write volume (4 workers, 9 tests), but
  it is not a production database. The suite is testing the API contract, not
  database performance.
- Pinning commits protects the stack from upstream drift, but the pins must be
  updated deliberately when the target changes.
- CI retries can hide a flaky test if the trace is ignored. The local 10-run
  acceptance uses retries 0, and `on-first-retry` preserves the failing attempt
  for WP7's flaky-test policy.

## Evidence

### 10 consecutive 4-worker runs (no retries)

All 10 runs passed, 9/9 tests each. Wall time includes Node and browser startup:

| Run | Wall | Playwright | Result |
| ---: | ---: | ---: | --- |
| 1 | 9.8 s | 7.5 s | 9 passed |
| 2 | 10.0 s | 7.7 s | 9 passed |
| 3 | 9.4 s | 7.3 s | 9 passed |
| 4 | 9.4 s | 7.2 s | 9 passed |
| 5 | 9.2 s | 7.1 s | 9 passed |
| 6 | 9.8 s | 7.7 s | 9 passed |
| 7 | 10.7 s | 7.9 s | 9 passed |
| 8 | 9.2 s | 7.0 s | 9 passed |
| 9 | 10.0 s | 7.8 s | 9 passed |
| 10 | 10.3 s | 7.7 s | 9 passed |

A second independent batch after Docker Desktop restarted (same code, fresh
containers) also passed **10/10**, with wall times 16.8–22.9 s and Playwright
times 13.5–17.3 s. The absolute times vary with Docker and host load; both
batches used `retries: 0`. Total across the two batches: **20/20 green**.

### Worker benchmark

Two rounds after the stack was warm, full suite, `fullyParallel: true`:

| Workers | Wall round 1 | Playwright round 1 | Wall round 2 | Playwright round 2 |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 15.4 s | 12.7 s | 13.9 s | 11.7 s |
| 2 | 9.1 s | 7.0 s | 9.5 s | 7.4 s |
| 4 | 9.0 s | 6.9 s | 9.0 s | 6.9 s |

The suite is small, so the fixed browser/setup cost dominates. The 4-worker
configuration still cuts Playwright time roughly in half versus one worker.
These are warm-stack measurements; a Docker restart adds several seconds of
cold-start time without changing the relative ordering.

### Repeat probe

`npx playwright test tests/ui --repeat-each=10 --workers=4`:
**41/41 passed** in 37.2 s (39.6 s wall). A second probe after the Docker restart
also passed 41/41 in 1.0 min. WP3's one-worker equivalent took 5.2 min.

### API identity probe against the local stack

6 concurrent registrations, each followed by `GET /user` with its own token:
**0/6 mismatches**. The local backend returned each token's own identity.

### API regression suite

`npm run test:api:local`: **15 requests / 53 assertions, 0 failed**, against the
local API. This includes the patched unauthorized-update contract.

### Local checks

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npx playwright test --list` | 9 tests in 6 files |
| `npm run test:local` | 9 passed (4 workers) |
| 10 × 4-worker runs (batch 1) | **10/10 green**, 9/9 each |
| 10 × 4-worker runs (batch 2, after Docker restart) | **10/10 green**, 9/9 each |
| `tests/ui --repeat-each=10 --workers=4` | 41/41 passed (37.2 s warm; 1.0 min after restart) |
| `npm run test:api:local` | 15 requests / 53 assertions, 0 failed |
| `waitForTimeout` in Playwright code | 0 |

## How to verify

```powershell
# Build, start, and wait for both health checks.
npm run stack:up

npm run typecheck
npm run test:local
npm run test:api:local

# 10 consecutive 4-worker runs with retries disabled.
# Use the test:local wrapper: it injects BASE_URL/API_BASE_URL for the local
# stack, while a bare `npx playwright test` would follow .env (the public demo).
foreach ($run in 1..10) {
  npm run test:local -- --workers=4 --reporter=line
  if ($LASTEXITCODE -ne 0) { throw "run $run failed" }
}

# UI repeat probe.
npm run test:local -- tests/ui --repeat-each=10 --workers=4 --reporter=line

# Stop and remove the disposable database.
npm run stack:down
```

PR [#5](https://github.com/ifhamm/QA-Assessment/pull/5) merged the branch as
`494d243` on 2026-11-02. The branch push, PR, and merge runs were all green on
the first attempt; see the CI section in `docs/metrics.md` for durations.
