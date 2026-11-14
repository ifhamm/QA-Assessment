# QA Automation Assessment

This repository contains the automation deliverables for the RealWorld / Conduit QA Automation Mentorship Assessment. The solution covers API regression testing, UI functional testing, cross-layer verification, CI execution including visual regression, and optional performance testing.

## Test Coverage

| Area | Tool | Coverage |
| --- | --- | --- |
| API | Postman + Newman | 15 request/test cases with 53 `pm.test` assertions covering registration, login, CRUD, authorization, invalid request handling, favorite/unfavorite, and deletion verification |
| UI Functional | Playwright + TypeScript | Successful login and article creation, invalid login, and protected-route redirect |
| Cross-layer | Playwright + APIRequestContext | API create -> UI verify, and UI update -> API verify |
| Visual regression | Playwright screenshots | Login page and authenticated article editor |
| Performance | k6 + local Express API | Low-load checks for product list and product detail endpoints |

## Prerequisites

For the main automation suite:

- Node.js 22+
- npm
- Git
- Chromium installed through Playwright

For the self-hosted RealWorld stack:

- Docker Desktop, or Docker Engine with Compose v2

For the optional performance test:

- k6 installed and available on `PATH`

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/ifhamm/QA-Assessment.git
cd QA-Assessment
npm ci
npx playwright install chromium
```

### Self-hosted stack (recommended)

The suite and CI target a self-hosted RealWorld stack pinned in
`docker-compose.yml`: the same Angular frontend as the public demo, a
Nitro/Prisma API, and nginx serving both on one origin through `/api`.

```bash
npm run stack:up       # build, start, and wait for both health checks
npm run test:local     # full Playwright suite against http://localhost:8081
npm run test:api:local # Newman against http://localhost:3000
npm run stack:down     # stop and delete the disposable SQLite database
```

`test:local` overrides `BASE_URL`, `API_BASE_URL`, and the optional auth
credentials for that process, so it does not need a `.env` file. The web app is
on `8081`; the API is on `3000`. Run a subset with, for example,
`npm run test:local -- tests/ui`.

The stack is disposable. `npm run stack:down` removes the container and its
database, so the next `stack:up` starts clean. The frontend and backend commits
are pinned in the Dockerfiles.

### Public demo option

The `.env.example` file still points at the public demo for manual exploration.
Copy it only if you deliberately want that target:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

```env
BASE_URL=https://demo.realworld.show
API_BASE_URL=https://api.realworld.show/api
AUTH_EMAIL=your-email@example.com
AUTH_PASSWORD=your-password
```

`AUTH_EMAIL` and `AUTH_PASSWORD` are optional. If they are absent or do not
authenticate, the setup project creates a session-local user and writes that
storage state instead.

Parallel stability runs must use the self-hosted target. The public backend
cannot preserve concurrent identities, which is the defect WP4 documents. `.env`
is intentionally ignored by Git; CI no longer reads URLs or credentials from
repository variables.

## Running the Tests

Install dependencies first with `npm ci`, then use the commands below.

### API regression tests

```bash
npm run test:api:local  # self-hosted API on localhost:3000
npm run test:api        # public demo API
```

Both run the exported Postman collection with Newman.

### UI tests

```bash
npm run test:ui
```

This runs the functional UI tests and the authenticated dashboard test against
the target in `.env`. For the self-hosted stack, use:

```bash
npm run test:local -- tests/ui
```

To run only the functional file:

```bash
npm run test:ui:functional
```

### Cross-layer tests

```bash
npm run test:cross
```

### Visual regression tests

Visual tests render only inside the pinned Playwright container, so local runs,
CI, and baseline generation share one Linux rendering environment:

```bash
npm run stack:up        # build and start the web + API stack
npm run test:visual     # alias for test:visual:linux
```

The command runs the two visual tests in
`mcr.microsoft.com/playwright:v1.63.0-noble` and compares them against the
committed `*-visual-linux.png` baselines. The old Windows baselines were removed
because they encoded a different renderer; on any host OS, use the container
command instead of running the visual project directly.

When an intentional UI change is approved, regenerate the baselines:

```bash
npm run test:visual:linux:update
```

Rules for changing a baseline:

- A baseline may change only for an intentional, reviewed UI change. The PR must
  include the visible before/after diff and the reason for the change.
- Never update a baseline just to make a failing visual test pass.
- The reviewer of the PR owns the baseline decision.
- Diff thresholds are the Playwright defaults; do not loosen them without a
  written justification in the decision note.

CI runs the visual tests in a separate `Visual Tests` job. A failed comparison
uploads the expected, actual, and diff images as the `visual-diffs` artifact.

### TypeScript validation

```bash
npm run typecheck
```

### Lint and stage tags

```bash
npm run lint        # ESLint 10 + typescript-eslint
npm run check:tags  # every host test carries @smoke or @regression
```

TypeScript 7 provides the `tsc` used by `npm run typecheck`. ESLint runs against
the TypeScript 6 compiler API (installed under the `typescript` alias) because
`typescript-eslint` does not support the TS 7 API yet; see the WP6 decision
note for details.

### Tags and staged runs

Each host test carries exactly one tag: `@smoke` for the fast gate, or
`@regression` for the deeper checks. Setup and visual tests stay untagged.
`npm run check:tags` fails when a tag is missing, duplicated, or attached to
the wrong project.

```bash
npm run test:smoke       # 3 tagged tests + setup
npm run test:regression  # 3 tagged tests, no setup dependency
```

### All Playwright tests

```bash
npm run test:local  # self-hosted stack, 7 host-rendered tests
npm test            # same host suite against the target in .env
```

Both commands exclude the `visual` Playwright project on purpose. Visual tests
are rendered only in the pinned container and run separately with
`npm run test:visual`.

### Optional performance test

The performance test intentionally runs against a small local Express API rather than the shared public practice application.

```bash
cd performance
npm ci
npm start
```

In a second terminal:

```bash
cd performance
npm run test:perf
```

The k6 scenario ramps from 0 to 5 VUs, holds 5 VUs, then ramps down. The thresholds require an HTTP error rate below 1% and p95 response time below 500 ms globally and for both tested endpoints.

## Project Structure

```text
.
├── .github/workflows/tests.yml       # GitHub Actions CI pipeline
├── eslint.config.mjs                 # Minimal TypeScript lint config
├── scripts/
│   └── check-test-tags.mjs           # Enforces @smoke / @regression tags
├── api/
│   └── conduit-api.ts                # Playwright API helper for setup, cleanup, and cross-layer checks
├── docker/
│   ├── api.Dockerfile                # Pinned Nitro/Prisma API image
│   ├── web.Dockerfile                # Pinned Angular frontend image
│   ├── nginx.conf                    # Same-origin /api proxy and SPA fallback
│   └── patches/                      # Documented API contract compatibility patch
├── fixtures/
│   └── test-base.ts                  # Per-test API/UI fixtures
├── pages/
│   ├── article.page.ts               # Article page object
│   ├── editor.page.ts                # Article editor page object
│   ├── login.page.ts                 # Login page object
│   └── navbar.component.ts           # Reusable navbar component assertions
├── performance/
│   ├── app/server.js                 # Local Express API used only for performance testing
│   ├── k6/products-performance.js    # k6 low-load scenario and thresholds
│   └── README.md                     # Performance-specific notes
├── postman/
│   └── conduit.postman_collection.json
├── tests/
│   ├── cross-layer/                  # API <-> UI consistency tests
│   ├── ui/                           # Playwright UI functional tests
│   ├── visual/                       # Visual regression tests and baselines
│   ├── cleanup.ts                    # Best-effort cleanup wrapper
│   └── test-data.ts                  # Worker-aware synthetic user/article generators
├── docs/
│   ├── decisions/                    # One decision note per work package
│   ├── evidence/                     # Committed visual failure evidence
│   └── pr/                           # PR descriptions
├── .dockerignore
├── .env.example
├── docker-compose.yml                # Self-hosted web + API stack
├── package.json
├── package-lock.json
├── playwright.config.ts
├── playwright.merge.config.ts        # Merge-only testDir for blob reports
└── tsconfig.json
```

## Main Design Decisions

The API regression suite is kept in Postman/Newman, while Playwright is used for UI functional testing and cross-layer verification. The Playwright API helper is therefore intentionally small: it supports test setup, cleanup, and API-side verification instead of duplicating the dedicated Postman regression suite.

Page Object Model classes centralize UI locators and common interactions for the login, article editor, and article pages. A lightweight navbar component is used for shared authentication-state assertions. The tests themselves remain responsible for scenario orchestration and expected outcomes.

Synthetic users and articles are generated for test isolation rather than relying on shared fixed test accounts. UI and cross-layer tests use API calls for efficient setup and cleanup when the UI behavior under test does not require performing those steps through the browser.

The Playwright configuration uses Chromium, a fixed 1280x720 viewport,
`fullyParallel`, four workers, screenshots on failure, and an HTML report
locally. CI writes blob reports and merges them into one HTML artifact, so a
sharded run still produces a single report. Local runs use zero retries and
retain traces on failure; CI uses one retry and records a trace on the first
retry. The retry is an infrastructure safety net, not the stability claim: the
WP4 acceptance probe is 10 consecutive four-worker runs with retries disabled.

The test target is a self-hosted stack rather than the shared public demo. WP3
proved that the public backend rotates other users' tokens during concurrent
registration/login, so a four-worker run cannot honestly pass against it. The
self-hosted frontend is pinned to the same Angular application that powers the
public demo; nginx proxies `/api` on the same origin so the browser needs no
CORS. The backend patch only aligns the unauthorized-update status with the
contract the existing Postman assertions already use.

## Test Data and Cleanup

`tests/test-data.ts` generates unique users and articles from three tiers of separation: a random run id assigned once per Playwright worker process, a visible worker-index label, and a monotonic counter inside that process. This makes identifier and slug collisions impossible across tests and workers, so the suite's isolation cannot depend on timestamps or execution order.

Playwright fixtures own the data lifecycle: setup via API, test, best-effort cleanup via API. Cleanup is wrapped by `tests/cleanup.ts`, which logs any cleanup failure without replacing the test result, so teardown problems stay visible in the logs and the test failure stays about the product. One deliberate exception remains: the UI test that creates an article through the browser cannot be pre-created by a fixture, so it extracts the slug from the page URL after publish (also when the redirect assertion fails) and cleans up at the end of the test.

The self-hosted API does not provide a user-deletion flow used by this suite,
so synthetic users remain until the disposable database is removed. The suite
logs a `405` warning per attempted deletion to keep that leak visible; unique
credentials prevent these accounts from interfering with later runs. The
Postman collection also creates unique data and deletes its article.

Tests do not share data or state with each other: data-owning tests use their
own per-test users, the dashboard is the only consumer of the shared setup
identity, and every test passes on its own (`--grep`) and with
`--fully-parallel --workers=4`. Ten consecutive four-worker runs passed with
retries disabled. The earlier public-environment failures and the identity probe
that motivated the self-hosted target are recorded in
[`docs/decisions/WP4-parallelism-reliability.md`](docs/decisions/WP4-parallelism-reliability.md).

The Postman/Newman collection also creates unique data and completes its main article lifecycle by deleting the created article and verifying that it is no longer available.

## CI Pipeline and Report

GitHub Actions runs on every push and pull request. The pipeline is staged so a
cheap failure stops before any container build:

```text
Static Checks (typecheck, lint, tags) ─┬─ API Tests
                                       ├─ UI Smoke (@smoke)
                                       ├─ UI Regression (@regression, shards)
                                       └─ Visual Tests (pinned image)
                                                ↓
                                          Merged Report
```

- **Static Checks** runs typecheck, ESLint, and the tag check.
- **API Tests** builds the API container and runs Newman against
  `http://localhost:3000`.
- **UI Smoke** runs the three `@smoke` host tests plus setup against
  `http://localhost:8081`.
- **UI Regression** runs the three `@regression` tests with `--no-deps`.
  The matrix defaults to one shard; `workflow_dispatch` can request more.
- **Visual Tests** builds both containers and runs the two visual tests inside
  `mcr.microsoft.com/playwright:v1.63.0-noble`; failed comparisons upload
  `visual-diffs`.
- **Merged Report** downloads every `blob-report-*`, merges them with
  `playwright.merge.config.ts`, verifies `playwright-report/index.html`, and
  uploads `merged-report`. The merge config pins `testDir` because the visual
  container records `/work/tests` while host jobs record the runner path.
- Each job removes the stack with `docker compose down -v` in an `always()`
  step. npm and Playwright browsers are cached; Docker layers are not shared
  between jobs, which is the main cost of the staged layout.

Sharding is implemented and proven, but it is opt-in because the measurements
do not justify it for 7 tests. The 1-shard staged run
[`43435185236`](https://github.com/ifhamm/QA-Assessment/actions/runs/43435185236)
took 3 m 17 s and 8.7 runner-minutes; the 3-shard run
[`43435791291`](https://github.com/ifhamm/QA-Assessment/actions/runs/43435791291)
took 3 m 07 s and 12.1 runner-minutes. Both produced a merged report with all
stages. The full comparison, including the retry-free local runs and the
worker benchmark, is in
[`docs/decisions/WP6-staged-ci-sharding.md`](docs/decisions/WP6-staged-ci-sharding.md)
and [`docs/metrics.md`](docs/metrics.md).

WP5 merged to `main` as `068f56a` (PR
[#7](https://github.com/ifhamm/QA-Assessment/pull/7)) on 2026-11-02; its docs
follow-up merged as `183167e` (PR
[#8](https://github.com/ifhamm/QA-Assessment/pull/8)) on 2026-11-13.

Green pre-WP6 `main` run
[41469719183](https://github.com/ifhamm/QA-Assessment/actions/runs/41469719183)
in 2 m 09 s: API 1 m 14 s, Playwright 1 m 55 s, Visual 1 m 49 s. The workflow
uses one CI retry with `on-first-retry` tracing; local stability evidence
remains retry-free.

## Additional Coverage

### Visual regression

Two Playwright visual checks run in CI:

- Login page
- Authenticated article editor

Both are compared only inside the pinned Playwright Linux container described
above. The viewport is fixed at 1280x720, animations are disabled, and the
editor test fixes and masks its generated username so synthetic data cannot
create a meaningless diff. The baseline-update rules are in the visual section
under Testing.

### Performance

A beginner-friendly k6 test is included under `performance/`. It targets a local Express application only, with two endpoints:

- `GET /api/products`
- `GET /api/products/1`

This avoids load-testing the shared public RealWorld practice environment.

## Known Limitations and Future Improvements

- Functional and cross-layer browser coverage currently targets Chromium only; Firefox and WebKit projects can be added later for cross-browser coverage.
- The default local target is the self-hosted stack. Pointing the suite back at the public demo is still possible through `.env`, but parallel runs there remain unreliable because the public backend rotates other users' tokens during registration/login. The defect and the self-hosted decision are documented in the WP4 decision note.
- The self-hosted stack pins the frontend and backend to specific commits. Updating those pins is a deliberate maintenance step; the backend also carries one small compatibility patch for the unauthorized-update status code.
- Visual baselines are Linux-only and must be produced in the pinned Playwright container. Running the visual project directly on Windows or macOS would compare against a different renderer, so those hosts must use `npm run test:visual`.
- The visual pages still load Google Fonts and Ionicons over the network. The container fixes the renderer and the committed baseline, but a blocked or failed font request changes the screenshot and fails the job instead of being silently ignored.
- The optional k6 suite is a low-load local baseline rather than a production-scale capacity test. Future extensions could add arrival-rate scenarios, authenticated users, stress/spike/soak testing, and performance smoke checks in CI.
- Synthetic test users remain in the disposable self-hosted database until `npm run stack:down` resets it. The `405` cleanup warning is expected because user deletion is not part of the tested API lifecycle.

## Approximate Time Spent

Approximately **12 hours across multiple sessions**, including test design, implementation, debugging, CI setup, optional visual/performance work, and documentation.
