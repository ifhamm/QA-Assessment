# QA Automation Assessment

This repository contains the automation deliverables for the RealWorld / Conduit QA Automation Mentorship Assessment. The solution covers API regression testing, UI functional testing, cross-layer verification, CI execution, and optional visual regression and performance testing.

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

```bash
npm run test:visual
```

For the self-hosted stack:

```bash
npm run test:local -- tests/visual
```

To intentionally regenerate the reviewed visual baselines after an approved UI change:

```bash
npx playwright test tests/visual --update-snapshots
```

Visual baselines should not be updated simply to make a failing test pass; the visual difference should be reviewed first.

### TypeScript validation

```bash
npm run typecheck
```

### All Playwright tests

```bash
npm run test:local  # recommended: self-hosted stack
npm test            # target from .env
```

Note that both commands also discover the optional visual tests because the
Playwright `testDir` is `./tests`. Visual tests are excluded from CI.

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
│   └── pr/                           # PR descriptions
├── .dockerignore
├── .env.example
├── docker-compose.yml                # Self-hosted web + API stack
├── package.json
├── package-lock.json
├── playwright.config.ts
└── tsconfig.json
```

## Main Design Decisions

The API regression suite is kept in Postman/Newman, while Playwright is used for UI functional testing and cross-layer verification. The Playwright API helper is therefore intentionally small: it supports test setup, cleanup, and API-side verification instead of duplicating the dedicated Postman regression suite.

Page Object Model classes centralize UI locators and common interactions for the login, article editor, and article pages. A lightweight navbar component is used for shared authentication-state assertions. The tests themselves remain responsible for scenario orchestration and expected outcomes.

Synthetic users and articles are generated for test isolation rather than relying on shared fixed test accounts. UI and cross-layer tests use API calls for efficient setup and cleanup when the UI behavior under test does not require performing those steps through the browser.

The Playwright configuration uses Chromium, a fixed 1280x720 viewport,
`fullyParallel`, four workers, HTML reporting, and screenshots on failure.
Local runs use zero retries and retain traces on failure; CI uses one retry and
records a trace on the first retry. The retry is an infrastructure safety net,
not the stability claim: the WP4 acceptance probe is 10 consecutive four-worker
runs with retries disabled.

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

GitHub Actions runs on every push and pull request. Both jobs build and start
the self-hosted stack, so CI does not depend on the public demo or repository
variables:

- **API job** builds the API container and runs Newman against
  `http://localhost:3000`.
- **Playwright job** builds both containers, runs typecheck, then the UI and
  cross-layer suites against `http://localhost:8081`.
- Each job removes the stack with `docker compose down -v` in an `always()` step.
- Playwright installs Chromium and uploads the HTML report as an artifact,
  retained for 7 days.

Latest recorded green run (WP4 merge, commit `494d243`):

[QA Automation Tests - Success](https://github.com/ifhamm/QA-Assessment/actions/runs/41462400575)

The PR run (`41462371220`) and the branch push run (`41462038159`) on the same
tip were green as well. The workflow uses one CI retry with `on-first-retry`
tracing; local stability evidence remains retry-free.

## Optional Work

### Visual regression

Two Playwright visual checks are included:

- Login page
- Authenticated article editor

The viewport is fixed at 1280x720. The editor test controls its dynamic username content before screenshot comparison so that synthetic test data does not create meaningless visual diffs.

### Performance

A beginner-friendly k6 test is included under `performance/`. It targets a local Express application only, with two endpoints:

- `GET /api/products`
- `GET /api/products/1`

This avoids load-testing the shared public RealWorld practice environment.

## Known Limitations and Future Improvements

- Functional and cross-layer browser coverage currently targets Chromium only; Firefox and WebKit projects can be added later for cross-browser coverage.
- The default local target is the self-hosted stack. Pointing the suite back at the public demo is still possible through `.env`, but parallel runs there remain unreliable because the public backend rotates other users' tokens during registration/login. The defect and the self-hosted decision are documented in the WP4 decision note.
- The self-hosted stack pins the frontend and backend to specific commits. Updating those pins is a deliberate maintenance step; the backend also carries one small compatibility patch for the unauthorized-update status code.
- Visual baselines were generated for headless Chromium on Windows. Cross-platform visual execution would require reviewed baselines in a consistent CI environment or a containerized visual-test environment.
- Optional visual tests are currently kept separate from the required CI UI/cross-layer steps to avoid platform-specific screenshot noise.
- The optional k6 suite is a low-load local baseline rather than a production-scale capacity test. Future extensions could add arrival-rate scenarios, authenticated users, stress/spike/soak testing, and performance smoke checks in CI.
- Synthetic test users remain in the disposable self-hosted database until `npm run stack:down` resets it. The `405` cleanup warning is expected because user deletion is not part of the tested API lifecycle.

## Approximate Time Spent

Approximately **12 hours across multiple sessions**, including test design, implementation, debugging, CI setup, optional visual/performance work, and documentation.
