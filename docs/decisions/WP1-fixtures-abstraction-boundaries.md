# WP1 — Fixtures & Abstraction Boundaries

- **Date:** 2026-10-31
- **Branch:** `wp1/fixtures-abstraction-boundaries`
- **Base:** `main` at `5364f30` (WP0 merged)
- **Nature:** refactor only. No assertion, timeout, retry, test-count, or snapshot change.

## Context

WP0 found that WP1 was already half done: `fixtures/test-base.ts` provided `api`, `loginPage`, `editorPage`, and `user`, and `ui-functional.spec.ts` used them. The remaining gaps were:

- both cross-layer tests ignored the fixtures and repeated registration, API login, article creation, and cleanup inline;
- page objects (`ArticlePage`, `NavBar`) were created with `new` inside test bodies;
- the cross-layer update test always deleted the old slug after a rename, so every run logged an expected `404`;
- `ArticlePage` was the only page object without a fixture, and `NavBar`'s role had not been decided.

So this WP completes the fixture layer instead of building a second one.

## Options considered

### 1. `beforeEach` / `afterEach`

Setup and cleanup live in hooks. This is familiar, but the test body receives no dependency: the user/article have to live in `let` variables outside the test. Teardown is manual and easy to forget, and hooks cannot express "this test needs a user, this one does not".

### 2. Test-scoped fixtures (`test.extend`) — chosen

Each fixture declares its dependencies, runs setup before `use()`, and runs teardown after `use()` even when the test fails. Playwright only creates the fixtures a test actually requests, so a test that does not need an article does not pay for one. Teardown order follows the dependency graph: `article` depends on `user`, so the article is deleted before the user is touched.

### 3. Worker-scoped fixtures (`{ scope: "worker" }`)

One user/article per worker is faster and would reduce API calls. It also shares mutable state between tests. That is a data-isolation decision, not a fixture-boundary decision, and it becomes dangerous as soon as `workers` is raised. Deferred to WP3/WP4.

## Decision

- Keep the existing `api`, `loginPage`, `editorPage`, and `user` fixtures as they are.
- Add `articlePage` and `navBar` fixtures so tests stop using `new`.
- Add an `article` fixture that creates one article through the API, exposes `{ data, created, slug }`, and deletes it in teardown.
- Keep all fixtures **test-scoped**. No worker-scoped state in WP1.
- Migrate three tests: both cross-layer tests and the UI "login and create article" test.
- Keep `NavBar` as a component. It has one responsibility (logged-in/out navbar state), is used by three specs, and is not a page. Do not grow it.

### Why `article.slug` is mutable

Updating an article through the UI changes its slug. The fixture deletes `article.slug`, so the update test assigns the new slug after publishing. Teardown then deletes the article once, instead of deleting the new slug and then trying the old one (which always returned `404`).

### Why the UI create test still cleans up itself

That test creates the article **through the UI**, which is the scenario under test. The fixture cannot create it in advance. The user is still fixture-owned; the article cleanup stays in a `try/finally` because only the test knows the slug. This is a deliberate boundary, not leftover duplication.

### The token-rotation discovery

While migrating, cleanup started returning `401`. The cause is the public API, not the refactor: **every login replaces the user's token**, so the token returned by registration is invalid after the test logs in through the UI. Cleanup therefore logs in again before deleting. This is why the original tests had extra login calls; they were necessary, not accidental duplication. No retry or sleep was added.

## Role boundaries

| Layer | Owns | Does not own |
| --- | --- | --- |
| Page object (`LoginPage`, `EditorPage`, `ArticlePage`) | Locators and user actions for one page | Test data, cleanup, cross-page navigation loops |
| Component (`NavBar`) | Shared assertions for one UI fragment | Navigation, test data |
| API client (`ConduitAPI`) | HTTP calls and response parsing | Test data or lifecycle decisions |
| Fixture (`test-base.ts`) | Setup/teardown and composition | Assertions or business rules |
| Factory (`tests/test-data.ts`) | Unique payloads | Lifecycle or cleanup |

## Metrics

Measured locally on 2026-10-31, Windows 11, Node 24.13.0, Playwright 1.63.0, 1 worker, retries 0.

| Item | Before (WP0 baseline) | After WP1 |
| --- | --- | --- |
| Playwright test executions | 9 | 9 |
| Full suite time | 1.2 min | 1.0 min |
| Cross-layer time | 40.4 s | 29.4 s |
| UI functional time | 29.6 s | 29.1 s |
| API login calls per full run | 8 | 6 |
| Successful UI logins per full run | 5 + 1 invalid | 5 + 1 invalid |
| Expected `404` cleanup warnings | 1 per run | 0 |
| `405` user-deletion warnings | 1 per fixture test | 1 per fixture test |
| UI `--repeat-each=10` | 41/41 passed | see `docs/metrics.md` |

Assertions are unchanged. The two cross-layer tests still assert the same title, body, URL, and API values.

## Trade-offs

- The `article` fixture is only useful when the article is created through the API. The UI create test intentionally does not use it.
- One user and one article are created per test, so the suite still depends on the public API. That is WP4 territory.
- The `user` fixture still attempts user deletion, which the API rejects with `405` and logs a warning. Cleaning that up needs a decision (WP3), not a silent removal.
- `ArticlePage.editButton` and `deleteButton` remain unused; they were not removed because WP8 may exercise edit/delete flows. Recorded as a follow-up.
- The visual editor test still builds its objects inline. It is local-only and belongs with the WP2 auth-state work.

## Follow-ups

- WP2: remove repeated UI logins with `storageState`; make the auth fallback usable when variables are absent.
- WP3: review the `405` cleanup warning and the unused article locators.
- WP4: worker-scoped setup and reliability against the public API.
- WP5: visual suite stays out of scope here.

## How to verify

```powershell
npm run typecheck
npx playwright test --list
npx playwright test --reporter=list
npx playwright test tests/ui --repeat-each=10 --reporter=list
npm run test:cross
npm run test:ui
```

Expected: 9 tests listed and passing; no `404` cleanup warning; the only cleanup warning is the expected `405` user-deletion message. CI may still fail for the public-environment reasons recorded in WP0; rerun the failed job manually, do not add retries.
