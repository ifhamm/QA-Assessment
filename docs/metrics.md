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
| UI dashboard | Playwright | 1 execution test | **No** |
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
| Run | [`38359351107`](https://github.com/ifhamm/QA-Assessment/actions/runs/38359351107) |
| Commit | `c5ec4f2` |
| Event | push |
| Conclusion | **failure** |
| Overall wall | 39 s |
| API job | success, 16 s |
| Playwright job | failure, 35 s |
| Typecheck step | success |
| UI tests step | failure at `setup` |
| Cross-layer step | skipped |
| HTML report artifact | uploaded |

Failure:

```text
Error: AUTH_EMAIL and AUTH_PASSWORD must be set for the authentication setup.
  at tests/auth.setup.ts:13:11
1 failed
  [setup] > tests/auth.setup.ts:8:6 > authenticate via API
3 did not run
```

The workflow provides `BASE_URL` and `API_BASE_URL` only. The setup project does not use its fallback when the auth variables are absent because it throws first.

### Last green run

| Item | Value |
| --- | --- |
| Run | [`38228308979`](https://github.com/ifhamm/QA-Assessment/actions/runs/38228308979) |
| Commit | `18028dd` (before `auth.setup.ts`) |
| Conclusion | success |
| API job | 14 s |
| Playwright job | 59 s |
| Overall wall | 61,981 s (queued for many hours) |

### What runs in CI

| Suite | In CI? |
| --- | --- |
| API (Newman) | Yes |
| Typecheck | Yes |
| UI functional (3) | Yes |
| Cross-layer (2) | Yes |
| Dashboard (1) | **No** |
| Visual (2) | **No** |
| k6 (1 scenario) | **No** |
| Merged report | No; HTML artifact only |
| JUnit / job summary | No |
| Trace artifact | Trace retained on failure inside the HTML report artifact |

Tests excluded from CI: dashboard, visual, and k6. In the latest run, the UI functional and cross-layer tests also did not execute because the setup project failed.

## Reporting quality

| Metric | Baseline |
| --- | --- |
| Reporters | `html` only |
| Local HTML | `playwright-report/index.html` |
| Trace | `retain-on-failure` |
| Screenshot | `only-on-failure` |
| Video | No |
| JUnit / JSON | No |
| Job summary | No |
| CI artifact | `playwright-report`, 7-day retention |

**Qualitative:** better than a bare console. A failure leaves an HTML report, screenshot, error context, and (on failure) a trace. There is no merged report, no JUnit output, no job summary, and no direct link from a CI summary to a trace. Triage still requires opening the artifact manually.

## Tooling health

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | Pass (exit 0) |
| Test discovery | `npx playwright test --list` | 9 tests in 6 files |
| Default test script | `npm test` | Present (`playwright test`) |
| API script | `npm run test:api` | Present |
| UI script | `npm run test:ui` | Present, but only `ui-functional.spec.ts` |
| Cross-layer script | `npm run test:cross` | Present |
| Visual script | `npm run test:visual` | Present |
| Performance script | `cd performance && npm run test:perf` | Present |
| Lint | N/A | No lint script/config |

## Reference

- Detailed findings: [`docs/audit.md`](audit.md)
- Decision note: [`docs/decisions/WP0-baseline-audit.md`](decisions/WP0-baseline-audit.md)
