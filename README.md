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

Create a local `.env` file from the provided example:

```bash
cp .env.example .env
```

On Windows PowerShell, this can be done with:

```powershell
Copy-Item .env.example .env
```

The expected configuration is:

```env
BASE_URL=https://demo.realworld.show
API_BASE_URL=https://api.realworld.show/api
```

`.env` is intentionally ignored by Git. In GitHub Actions, the same non-secret URLs are configured as repository Actions variables named `BASE_URL` and `API_BASE_URL`.

## Running the Tests

Install dependencies first with `npm ci`, then use the commands below.

### API regression tests

```bash
npm run test:api
```

This runs the exported Postman collection with Newman.

### UI functional tests

```bash
npm run test:ui
```

### Cross-layer tests

```bash
npm run test:cross
```

### Visual regression tests

```bash
npm run test:visual
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
npm test
```

Note that `npm test` also discovers the optional visual tests because the Playwright `testDir` is `./tests`.

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
│   └── test-data.ts                  # Synthetic user/article generators
├── .env.example
├── package.json
├── package-lock.json
├── playwright.config.ts
└── tsconfig.json
```

## Main Design Decisions

The API regression suite is kept in Postman/Newman, while Playwright is used for UI functional testing and cross-layer verification. The Playwright API helper is therefore intentionally small: it supports test setup, cleanup, and API-side verification instead of duplicating the dedicated Postman regression suite.

Page Object Model classes centralize UI locators and common interactions for the login, article editor, and article pages. A lightweight navbar component is used for shared authentication-state assertions. The tests themselves remain responsible for scenario orchestration and expected outcomes.

Synthetic users and articles are generated for test isolation rather than relying on shared fixed test accounts. UI and cross-layer tests use API calls for efficient setup and cleanup when the UI behavior under test does not require performing those steps through the browser.

The current Playwright configuration uses Chromium, a fixed 1280x720 viewport, one worker, no retries, HTML reporting, screenshots on failure, and traces retained on failure. Running with one worker is intentional for this assessment-sized suite and avoids adding unnecessary concurrency against a shared public practice environment.

## Test Data and Cleanup

`tests/test-data.ts` generates unique users and articles by combining the current timestamp with a random suffix. This prevents repeated runs from colliding with previously created data.

Article-producing Playwright tests use `try/finally` cleanup so article deletion is still attempted when an assertion fails after the article has already been created. Cleanup is performed through the API because it is faster and more deterministic than navigating through the UI solely for teardown.

The public practice API does not provide a user-deletion flow used by this suite, so synthetic user accounts created during tests can remain on the shared environment. Unique credentials prevent these accounts from interfering with future runs.

The Postman/Newman collection also creates unique data and completes its main article lifecycle by deleting the created article and verifying that it is no longer available.

## CI Pipeline and Report

GitHub Actions runs on every push and pull request. The workflow contains separate jobs for:

- API tests with Newman
- Playwright UI and cross-layer tests
- TypeScript type checking
- Playwright Chromium installation
- Playwright HTML report upload as an artifact, retained for 7 days

Latest successful CI run:

[QA Automation Tests #3 - Success](https://github.com/ifhamm/QA-Assessment/actions/runs/34882916303)

The successful run completed both the API and Playwright jobs and produced the `playwright-report` artifact.

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
- Tests currently use one Playwright worker. Parallel execution or sharding was intentionally not added because the suite is small and the target is a shared public environment.
- Visual baselines were generated for headless Chromium on Windows. Cross-platform visual execution would require reviewed baselines in a consistent CI environment or a containerized visual-test environment.
- Optional visual tests are currently kept separate from the required CI UI/cross-layer steps to avoid platform-specific screenshot noise.
- The optional k6 suite is a low-load local baseline rather than a production-scale capacity test. Future extensions could add arrival-rate scenarios, authenticated users, stress/spike/soak testing, and performance smoke checks in CI.
- Synthetic test users may remain in the shared RealWorld environment because user deletion is not part of the tested API lifecycle.

## Approximate Time Spent

Approximately **12 hours across multiple sessions**, including test design, implementation, debugging, CI setup, optional visual/performance work, and documentation.
