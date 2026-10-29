# WP0 Audit — Baseline & Reality Check

- **Date:** 2026-10-29
- **Repository:** `https://github.com/ifhamm/QA-Assessment`
- **Audited revision:** `c5ec4f22e4c037e1fc06243f9b2174f4cbeaea60` (`main`, 2026-10-13)
- **Branch used for this work package:** `wp0/baseline-audit`
- **OS:** Windows 11 Home Single Language, build 10.0.26200
- **Node:** v24.13.0
- **npm:** 11.6.2
- **Playwright:** 1.63.0
- **TypeScript:** 7.0.2
- **k6:** v1.5.0
- **Application under test:** `https://demo.realworld.show`
- **API under test:** `https://api.realworld.show/api`

**Scope discipline:** this WP adds documentation only. No test, page object, fixture, API helper, workflow, or project/config file was modified. The only non-doc addition is `docs/PRD.md`, which is the input document and was missing from the repository.

**How the measurements were taken:** fresh clone of `main`, `npm ci`, Chromium 1243 installed, synthetic `.env` with `BASE_URL`, `API_BASE_URL`, and synthetic `AUTH_EMAIL`/`AUTH_PASSWORD` values, all suites run locally on one worker. The public app and API were reachable throughout.

---

## 1. Executive summary

The repository is real, much richer than a bare scaffold, and most of the README's coverage claims are accurate. API (15 requests / 53 assertions), UI (4 tests), cross-layer (2 tests), visual (2 tests), and k6 (1 scenario) all pass locally. The full Playwright suite (9 executions including setup) passed in about 1.3 minutes; the UI layer passed 41/41 under `--repeat-each=10`; the API suite ran 15 requests with 0 failures; k6 passed all thresholds.

The most important finding is not a missing layer: **CI is red on `main`.** The latest run (`38359351107`, commit `c5ec4f2`) fails in the Playwright job because `tests/auth.setup.ts` requires `AUTH_EMAIL` and `AUTH_PASSWORD`, but the workflow only provides `BASE_URL` and `API_BASE_URL`. The API job passes; the cross-layer step is skipped. The README still advertises an older successful run.

There are also real documentation and coverage gaps:

1. CI is red on `main`; the README's "Latest successful CI run" is stale.
2. The README tells the reader to `cp .env.example .env`, but `.env.example` does not exist.
3. The README's project tree omits `fixtures/test-base.ts`, `tests/auth.setup.ts`, and `tests/ui/dashboard.spec.ts`.
4. `tests/ui/dashboard.spec.ts` is not run in CI. CI only runs `ui-functional` and `cross-layer`.
5. Visual and k6 suites are excluded from CI (consistent with the README's "optional" framing, but relevant to the PRD metrics).
6. The repo already contains partial WP1/WP2 work (fixtures, auth setup, storage state, dashboard), so the PRD's starting assumptions are out of date.
7. The cross-layer tests still bypass the fixtures and repeat registration/login/cleanup inline.
8. Cleanup is noisy: every cross-layer update triggers an expected 404 warning for the old slug, and every UI test with the `user` fixture logs a 405 "user deletion not supported" warning.

---

## 2. Actual structure

```text
.
├── .github/workflows/tests.yml       # 2 jobs: API (Newman), Playwright
├── .gitignore
├── README.md
├── api/conduit-api.ts                # APIRequestContext client
├── fixtures/test-base.ts             # test.extend: api, loginPage, editorPage, user
├── pages/article.page.ts
├── pages/editor.page.ts
├── pages/login.page.ts
├── pages/navbar.component.ts
├── performance/
│   ├── README.md
│   ├── app/server.js                 # local Express API
│   ├── k6/products-performance.js
│   ├── package.json
│   └── package-lock.json
├── postman/conduit.postman_collection.json
├── tests/
│   ├── auth.setup.ts                 # setup project -> storageState
│   ├── test-data.ts
│   ├── cross-layer/cross-layer.spec.ts
│   ├── ui/dashboard.spec.ts
│   ├── ui/ui-functional.spec.ts
│   ├── visual/editor.visual.spec.ts
│   ├── visual/editor.visual.spec.ts-snapshots/article-editor-chromium-win32.png
│   ├── visual/login.visual.spec.ts
│   └── visual/login.visual.spec.ts-snapshots/login-page-chromium-win32.png
├── package.json
├── package-lock.json
├── playwright.config.ts
└── tsconfig.json
```

Missing from the repository but referenced by documentation or expected by the PRD: `.env.example` (README), and the PRD itself (`docs/PRD.md`, added by this WP).

---

## 3. README claims vs reality

| # | README claim | Actual | Impact |
| --- | --- | --- | --- |
| 1 | "Create a local `.env` file from the provided example: `cp .env.example .env`." | `.env.example` does not exist. | A newcomer cannot follow the documented local setup path. |
| 2 | "Latest successful CI run: QA Automation Tests #3 - Success." | Latest run on `main` is **failure** (`38359351107`, 2026-10-13, commit `c5ec4f2`). Last green run was `38228308979` on `18028dd`, before `auth.setup.ts` was added. | The badge of health is stale and the current pipeline is broken. |
| 3 | Project tree lists `tests/` contents but not `fixtures/`, `tests/auth.setup.ts`, or `tests/ui/dashboard.spec.ts`. | All three exist and are used. | A reader cannot understand the auth setup or the fixture layer from the tree. |
| 4 | Coverage table says UI functional = "Successful login and article creation, invalid login, and protected-route redirect." | True, plus a separate `dashboard.spec.ts` authenticated test. | The table undercounts UI coverage. |
| 5 | "In GitHub Actions, the same non-secret URLs are configured as repository Actions variables named `BASE_URL` and `API_BASE_URL`." | True, but `AUTH_EMAIL` and `AUTH_PASSWORD` are also required by `auth.setup.ts` and are not provided. | CI fails at the setup project. |
| 6 | "The current Playwright configuration uses Chromium, a fixed 1280x720 viewport, one worker, no retries, HTML reporting, screenshots on failure, and traces retained on failure." | True. `trace: "retain-on-failure"`. | No mismatch. |
| 7 | "Visual baselines were generated for headless Chromium on Windows." | True: both snapshots are `*-chromium-win32.png`. | Visual tests can only be trusted on Windows; CI does not run them. |
| 8 | "Optional visual tests are currently kept separate from the required CI UI/cross-layer steps." | True: the workflow does not run `test:visual`. | Visual is not protected by CI (WP5 target). |
| 9 | "The current Playwright configuration uses ... one worker ... intentionally." | True: `workers: 1`, `fullyParallel: false`. | Parallelism work is untouched (WP4 target). |
| 10 | "The Postman/Newman collection also creates unique data and completes its main article lifecycle." | True: 15 requests, 53 assertions, article deleted and verified 404. | No mismatch. |
| 11 | "The public practice API does not provide a user-deletion flow used by this suite." | True: `deleteUser` calls `DELETE /user`, receives 405, and logs a warning. | Users are not cleaned up; every fixture-using UI test logs the warning. |
| 12 | "Article-producing Playwright tests use `try/finally` cleanup." | True, but the cross-layer update test still attempts to delete the old slug after the update (always 404). | Cleanup noise trains readers to ignore warnings. |
| 13 | "A lightweight navbar component is used for shared authentication-state assertions." | True: `NavBar` is used by UI functional, cross-layer, and the visual editor test. | Thin but justified (see section 8). |
| 14 | "`npm test` also discovers the optional visual tests because the Playwright `testDir` is `./tests`." | True, and it also discovers `auth.setup.ts` and `dashboard.spec.ts`. | CI does not use `npm test`; it runs narrower scripts. |
| 15 | "Node.js 22+". | CI uses Node 22; local audit used Node 24.13.0 successfully. | No mismatch observed. |
| 16 | README does not document `AUTH_EMAIL`, `AUTH_PASSWORD`, `storageState`, `auth.setup.ts`, or the setup project. | All exist and are required for a normal full run. | Local setup and CI failure are hard to diagnose from the README. |

---

## 4. PRD assumptions vs this repository

The PRD was written from an older README state. The repository has moved ahead: some WP1 and WP2 work already exists.

| Area | PRD assumption | Actual at `c5ec4f2` | Impact |
| --- | --- | --- | --- |
| Repository | Git repo with README, CI, API, UI, cross-layer, visual, k6. | True. | Foundation is present. |
| API tests | Postman + Newman, 15 requests / 53 assertions. | Exactly matches; all pass locally. | No work needed for WP0 evidence. |
| UI tests | 3 UI functional tests. | 3 functional + 1 dashboard = 4. | Dashboard is an extra. |
| Cross-layer | 2 tests. | 2 tests. | Matches. |
| Visual | 2 tests, Windows baselines. | 2 tests, `*-win32.png` baselines. | Matches; CI excluded by design. |
| Performance | k6 local Express smoke. | 1 scenario, 150 iterations, 300 checks. | Matches. |
| CI | GitHub Actions with API and Playwright jobs. | 2 jobs, but latest run fails. | WP0 cannot claim green CI. |
| Fixtures (WP1) | Not yet implemented; create `test.extend` fixtures. | `fixtures/test-base.ts` already provides `api`, `loginPage`, `editorPage`, and `user`; UI functional uses them. | WP1 is partially done. Cross-layer still bypasses fixtures. |
| Auth state (WP2) | Not yet implemented; add setup project/storageState. | `tests/auth.setup.ts`, `playwright/.auth/user.json`, `setup` + `authenticated` projects, and `dashboard.spec.ts` exist. | WP2 is partially done, but CI is broken by missing auth env vars and setup still performs a UI login. |
| Test data (WP3) | Tidy factories; unique per test/worker. | `tests/test-data.ts` and fixture user are unique via timestamp + random suffix. | Good baseline; cleanup still weak. |
| Parallelism (WP4) | 1 worker, no `fullyParallel`; find flakiness. | `workers: 1`, `fullyParallel: false`, `retries: 0`. | 0 flaky found in the short probe; no benchmark yet. |
| Visual in CI (WP5) | Visual must run in CI with Linux baselines. | Visual only local, Windows baselines, not in CI. | Matches PRD's problem statement. |
| Staged CI/sharding (WP6) | Tags, stages, sharding, merged report. | Simple 2-job workflow, no tags/sharding/merge. | WP6 starts from a working baseline, not from zero. |
| Reporting/gates (WP7) | HTML + JUnit + job summary, gates. | HTML only; trace on failure; no JUnit/summary/gates. | WP7 starts from HTML + trace. |
| Documentation (WP9) | Update README to current state. | README mostly current but stale CI link and missing auth/env docs. | Docs work remains. |

---

## 5. Local baseline results

All runs were on one worker, Chromium, retries 0, against the public app/API.

### Playwright full suite

| Item | Result |
| --- | --- |
| Tests discovered | 9 executions: 1 setup + 1 dashboard + 3 UI functional + 2 cross-layer + 2 visual |
| Result | **9 passed** |
| Playwright time | 1.3 min (about 78 s) |
| Wall time | 81.3 s (includes Node/browser startup) |
| Per-test durations (last local run) | setup 8.0 s; dashboard 4.4 s; cross create 15.7 s; cross update 10.1 s; UI create 11.9 s; invalid login 5.8 s; redirect 2.4 s; visual editor 8.2 s; visual login 3.9 s |

### Per-layer runs

| Layer / command | Tests | Result | Playwright time | Wall time |
| --- | ---: | --- | ---: | ---: |
| UI functional `npm run test:ui -- --reporter=list` | 4 incl. setup | 4 passed | 29.6 s | 35.0 s |
| UI layer `npx playwright test tests/ui --reporter=list` | 5 incl. setup + dashboard | 5 passed | 56.1 s | 60.7 s |
| Cross-layer `npm run test:cross -- --reporter=list` | 3 incl. setup | 3 passed | 40.4 s | 43.9 s |
| Visual `npm run test:visual -- --reporter=list` | 3 incl. setup | 3 passed | 33.9 s | 37.3 s |
| API `npm run test:api` | 15 requests / 53 assertions | 0 failed | 8.2 s | 22.8 s |
| k6 `npm run test:perf` | 1 scenario / 150 iterations / 300 checks | 0 failed; all thresholds pass | 40.1 s | 45.5 s |

Notes:
- The UI-layer run was slower than the full-suite UI portion because the public app's login/create flow was slow on that attempt (setup 14.5 s, create 17.6 s). This is environment variance, not a test change.
- API: p95 448 ms average response time, min 266 ms, max 1298 ms; 4.98 kB received.
- k6: 300/300 checks, 0% HTTP failures, p95 1.87 ms globally, 1.92 ms list, 1.76 ms detail, 150 iterations, 5 max VUs.

---

## 6. Flakiness probe

`npx playwright test tests/ui --repeat-each=10 --reporter=list`

| Item | Result |
| --- | --- |
| Test executions | 41: setup once + dashboard ×10 + UI functional ×30 |
| Result | **41 passed** |
| Playwright time | 5.0 min |
| Wall time | 313.1 s |
| Failures/flaky | 0 observed |

With `retries: 0`, this probe detects failures but cannot detect "passes only on retry" behaviour. No `waitForTimeout` calls were found. The only explicit timeouts are two hardcoded 10 s waits in the cross-layer update test.

---

## 7. CI baseline

### Latest run on `main`

- Run: [`38359351107`](https://github.com/ifhamm/QA-Assessment/actions/runs/38359351107), commit `c5ec4f2`, event `push`, 2026-10-13.
- Overall: **failure**, 39 s wall.
- API job: success, 16 s.
- Playwright job: failure, 35 s.
  - Typecheck step: success.
  - UI tests: **failure at `setup` project**.
  - Cross-layer tests: skipped.
  - HTML report uploaded.
- Failure from the job log:

```text
Error: AUTH_EMAIL and AUTH_PASSWORD must be set for the authentication setup.
  at tests/auth.setup.ts:13:11
1 failed
  [setup] > tests/auth.setup.ts:8:6 > authenticate via API
3 did not run
```

The workflow only sets `BASE_URL` and `API_BASE_URL`. `tests/auth.setup.ts` throws when either auth variable is missing, so its own fallback path (create a session-local user on 401) is unreachable when the variables are absent.

### Last green run

- Run: [`38228308979`](https://github.com/ifhamm/QA-Assessment/actions/runs/38228308979), commit `18028dd`, 2026-10-12/13.
- Overall: success; wall 61,981 s because the run sat queued for many hours.
- API job: success, 14 s.
- Playwright job: success, 59 s.
- This run predates `auth.setup.ts`; it does not prove that the current auth setup works in CI.

### What CI actually runs

| Suite | In CI? |
| --- | --- |
| API (Newman) | Yes, separate job |
| Typecheck | Yes |
| UI functional (3 tests) | Yes, via `npm run test:ui` |
| Cross-layer (2 tests) | Yes, via `npm run test:cross` |
| Dashboard (1 test) | **No** |
| Visual (2 tests) | **No** |
| k6 | **No** |
| Merged report | No; HTML artifact only |
| JUnit / job summary | No |

Because `test:ui` and `test:cross` each depend on the `setup` project, the setup runs twice in a green pipeline. The latest run never reached the actual UI or cross-layer tests.

---

## 8. UI login count

Counted from the code paths used by each run. "Successful UI login" means the login form was submitted with valid credentials; "submissions" also counts the invalid-credentials test.

| Scope | Successful UI logins | Invalid submissions | API login calls |
| --- | ---: | ---: | ---: |
| Full local Playwright run | 5 | 1 | 8 |
| Intended CI Playwright job (if setup worked) | 5 | 1 | 8 |
| UI suite `tests/ui`, one repeat | 2 | 1 | 3 |
| UI suite `tests/ui`, 10 repeats | 11 | 10 | 12 |

Breakdown:
- `auth.setup.ts`: 2 API login calls (configured credentials fail with 401, fallback user is registered and logged in) + 1 UI login. This runs once locally; in CI it would run twice (once for `test:ui`, once for `test:cross`).
- `ui-functional.spec.ts:10`: 1 UI login + 1 cleanup API login.
- `ui-functional.spec.ts:56`: 1 invalid UI submission.
- `ui-functional.spec.ts:73`: none.
- `cross-layer.spec.ts:13`: 1 UI login + 2 API logins.
- `cross-layer.spec.ts:51`: 1 UI login + 3 API logins.
- `visual/editor.visual.spec.ts`: 1 UI login.
- `visual/login.visual.spec.ts`: none.
- `dashboard.spec.ts`: none (uses storage state).

The UI login is therefore not yet removed from non-login tests. The setup project logs in via the UI to produce storage state, and cross-layer/visual tests still log in individually.

---

## 9. Abstraction inventory

| Abstraction | Why it exists | Used by | Still needed? | Notes / decision |
| --- | --- | --- | --- | --- |
| `pages/login.page.ts` — `LoginPage` | Owns login locators, the UI login action, and the error assertion. | UI functional, cross-layer, visual editor, auth setup uses raw locators | **Yes.** | Keep one explicit UI login test; WP2 should remove the other UI logins. |
| `pages/editor.page.ts` — `EditorPage` | Owns editor navigation and form interactions. | UI functional, cross-layer | **Yes.** | Also provided as a fixture. |
| `pages/article.page.ts` — `ArticlePage` | Owns article title/body assertions and edit/delete locators. | UI functional, cross-layer | **Yes.** | `editButton`/`deleteButton` are declared but unused. Remove in WP1 unless WP8 exercises them. Not a fixture yet; instantiated inline. |
| `pages/navbar.component.ts` — `NavBar` | Shared logged-in/logged-out navbar assertions. | UI functional, cross-layer, visual editor | **Yes for now.** | Decision: keep it as a component. It is thin (two assertion methods, no state) but is reused by three test files and has a single coherent responsibility. Re-evaluate in WP1: if it stays assertion-only, fold it into a fixture/helper rather than growing it into a page object. |
| `api/conduit-api.ts` — `ConduitAPI` | Wraps `APIRequestContext` for register/login/article CRUD and best-effort user deletion. | Fixtures, cross-layer, visual editor | **Yes.** | `deleteUser` expects 405 and returns false; `deleteArticle` warns instead of throwing. Cleanup semantics need a decision in WP1/WP3. |
| `fixtures/test-base.ts` — `test.extend` | Owns API client, login/editor page objects, and a synthetic user with teardown. | UI functional (and available to all Playwright tests) | **Yes.** | Good WP1 foundation, but only `ui-functional` uses it. Cross-layer still builds dependencies inline. |
| `tests/auth.setup.ts` — setup project | Produces `playwright/.auth/user.json` for authenticated tests. | `dashboard.spec.ts` via `authenticated` project | **Yes, but brittle in CI.** | Requires `AUTH_EMAIL`/`AUTH_PASSWORD` even though it has a fallback; does an API login plus a UI login. |
| `tests/test-data.ts` — `uniqueId`, `syntheticUser`, `syntheticArticle` | Generates unique users/articles. | Cross-layer, UI functional, visual editor | **Yes.** | Adequate; WP3 can formalize factories. |
| `tests/visual/*` | Visual regression for login and editor. | Local only | **Yes.** | Windows baselines; not in CI. |
| `postman/conduit.postman_collection.json` | API regression suite. | `npm run test:api` | **Yes.** | 15 requests, 53 assertions. |
| `performance/` | Local Express API + k6 smoke. | `npm run test:perf` | **Yes.** | Not in CI. |

No AI/agentic abstractions, no database verification, no self-healing, and no third-party dashboards were found.

---

## 10. Prioritized problems

### P0 — blocks a healthy baseline

1. **CI is red on `main`.** Latest run fails in the setup project because `AUTH_EMAIL`/`AUTH_PASSWORD` are missing; the UI and cross-layer tests never run. The README's CI link is stale.
2. **README setup is broken.** `.env.example` is referenced but absent, so `cp .env.example .env` fails.
3. **The auth setup contradicts itself.** It throws when credentials are absent, which prevents the fallback that was written for exactly that case. This is the root cause of the CI failure.

### P1 — coverage and duplication

4. **Dashboard test is not in CI.** `test:ui` runs only `ui-functional.spec.ts`; `test:cross` runs only cross-layer. `dashboard.spec.ts` is invisible to CI.
5. **UI logins are still repeated.** Full local run: 5 successful UI logins + 1 invalid submission; intended CI: 5 + 1, with setup twice. WP2's goal is not met.
6. **Cross-layer bypasses the fixtures.** Both cross-layer tests construct `ConduitAPI` and page objects inline, register users, and perform cleanup inline. This is duplicated setup the PRD wants moved into fixtures.
7. **Cleanup is noisy and partly hidden.** Cross-layer update always logs a 404 for the old slug; UI tests log 405 "user deletion not supported"; `deleteArticle` only warns. A failed cleanup is indistinguishable from expected noise.
8. **Visual is not protected by CI.** Windows baselines exist; CI is Ubuntu and does not run visual. WP5 starts from the current local-only state.
9. **`test:ui` naming is misleading.** It runs functional UI only, not `tests/ui` (dashboard included). There is no script for the full UI layer.

### P2 — performance, reporting, maintainability

10. **One worker / no parallelism.** `workers: 1`, `fullyParallel: false`; no benchmark data yet.
11. **No tags, sharding, merged report, or quality gates.**
12. **Reporting is HTML-only.** No JUnit, no job summary, no links from summary to traces. Trace is retained on failure, which is good.
13. **Two hardcoded 10 s timeouts and two CSS-class locators** remain (`.article-content`, `.error-messages`).
14. **Markdown coupling:** tests strip `**` manually from article bodies.
15. **Public shared environment dependency.** The app/API can be slow or rate-limited; UI-layer setup took 14.5 s on one run and 8.0 s on another. There are no API-level guards around UI timings.
16. **No lint/format check.** Typecheck passes, but style is unenforced.
17. **Users cannot be cleaned up.** The API returns 405 for user deletion; synthetic users accumulate on the shared environment.
18. **`ArticlePage.editButton`/`deleteButton` are unused.**

---

## 11. What is already good

- Typecheck passes (`tsc --noEmit`, exit 0).
- All local suites are green: API 53/53 assertions, Playwright 9/9, k6 all thresholds.
- UI repeat probe: 41/41 passes, 0 failures.
- Unique synthetic data with timestamp + random suffix; no hard-coded credentials in tests.
- `.gitignore` covers `node_modules`, `.env`, Playwright reports, `playwright/.auth`, and traces.
- `trace: "retain-on-failure"` and screenshots on failure are configured.
- Article cleanup is wrapped in `try/finally`, and the UI slug is extracted before assertions (the earlier leak is fixed).
- CI uploads the HTML report on failure and retains it for 7 days.
- API tests cover auth, CRUD, authorization, validation, favorite/unfavorite, deletion, and deletion verification.
- Visual editor test masks the dynamic username.
- k6 thresholds are meaningful and pass comfortably.

---

## 12. Open questions for the owner

These are repeated in the PR description:

1. **Should WP0 fix the CI auth-env failure?** The smallest behavior-neutral fix would be to provide synthetic `AUTH_EMAIL`/`AUTH_PASSWORD` in CI (or let `auth.setup.ts` use its fallback when they are absent). Without it, this docs-only PR will also fail CI. Fixing it now is arguably outside audit-only scope.
2. **Should `dashboard.spec.ts` be added to CI?** It is currently invisible to the pipeline.
3. **Should `.env.example` be added?** The README already tells users to copy it.
4. **Are WP1/WP2 considered already done?** The repo already contains fixtures, auth setup, storage state, and a dashboard. The PRD's sequence assumes they do not exist, so the next WP's scope needs confirmation.
5. **Should visual baselines be regenerated on Linux and run in CI now, or left for WP5?** Current baselines are Windows-only.

---

## 13. Reproduction commands

```powershell
npm ci
npx playwright install chromium

# Local environment (synthetic values; .env is ignored)
# BASE_URL=https://demo.realworld.show
# API_BASE_URL=https://api.realworld.show/api
# AUTH_EMAIL=<synthetic>
# AUTH_PASSWORD=<synthetic>

npm run typecheck
npx playwright test --reporter=list
npx playwright test tests/ui --repeat-each=10 --reporter=list
npm run test:api
npm run test:visual

cd performance
npm ci
npm start          # separate terminal
npm run test:perf
```
