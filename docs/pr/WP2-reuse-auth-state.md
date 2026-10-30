# WP2: Reuse Auth State

## Summary

This PR removes repeated UI logins without removing login-flow coverage. The setup project now builds `storageState` from an API token, cross-layer and visual tests inject their own per-test tokens, and the dashboard is part of `test:ui` and CI.

It is an auth refactor: the test count (9), assertions, timeouts, retries, and visual snapshots are unchanged.

## What changed

- `tests/auth-storage.ts` (new)
  - Centralizes the app's `jwtToken` localStorage key.
  - Builds a Playwright storage state from an API token.
- `tests/auth.setup.ts`
  - Uses `request`, not `page`; setup no longer performs a UI login.
  - No longer throws when `AUTH_EMAIL`/`AUTH_PASSWORD` are absent; it creates a session-local user instead.
  - Keeps the existing fallback for configured credentials that return `401`.
  - Still throws for non-401 API errors.
- `fixtures/test-base.ts`
  - Adds `authenticatedPage`, which injects the per-test user's JWT into `localStorage` before the first navigation.
  - The fixture is test-scoped and does not change tracing, screenshots, or viewport configuration.
- `tests/cross-layer/cross-layer.spec.ts`
  - Both tests use `authenticatedPage` instead of `loginPage.goto()` + `loginPage.login()`.
  - Test 2 reads the article with `user.token`; no UI login rotates it now.
  - Assertions, URLs, and timeouts are unchanged.
- `tests/visual/editor.visual.spec.ts`
  - Uses `authenticatedPage`, `user`, `editorPage`, and `navBar` instead of inline page objects, registration, and UI login.
  - The snapshot is unchanged; no `--update-snapshots` was used.
- `package.json`
  - `test:ui` now runs `tests/ui` (functional + dashboard).
  - Adds `test:ui:functional` for the old focused command.
- `.github/workflows/tests.yml`
  - `AUTH_EMAIL`/`AUTH_PASSWORD` are optional pass-throughs from repository variables; the synthetic defaults are removed so the absent-variable fallback is exercised.
  - `npm run test:ui` now includes the dashboard.
- `README.md`, `.env.example`
  - Document the optional auth variables and the fallback.
  - Document the new `test:ui` scope.
- `docs/decisions/WP2-reuse-auth-state.md`, `docs/metrics.md`, `docs/progress.md`
  - Decision note, before/after metrics, and tracker refresh.

## Why

WP0/WP1 found that the repository already had an auth setup, storage state, and dashboard, but:

- setup threw before its fallback when auth variables were missing;
- the full run still performed 5 successful UI logins + 1 invalid submission;
- the dashboard was not in CI;
- `test:ui` ran only the functional file;
- cross-layer tests need their own users, so the shared setup user is the wrong identity for them.

## Auth model

| Mode | Used by | Reason |
| --- | --- | --- |
| Shared `storageState` | Dashboard | One read-only identity; no per-test data ownership. |
| Per-test API token injection | Cross-layer, visual editor | Each test owns its user/article; the shared setup user would be the wrong identity. |
| Per-test UI login | UI create, invalid login | The login flow itself is under test. |
| Worker-scoped auth | None | Shared identity and mutable token; deferred to WP3/WP4. |

The public API rotates the token on every login. The article fixture still logs in before cleanup as a safety net. In the cross-layer tests no UI login occurs, so `user.token` remains valid for the API read.

## Assertion parity

- Cross-layer test 1: same logged-in navbar, title, and body assertions.
- Cross-layer test 2: same initial value, redirect, title, and API title/body assertions.
- UI functional test 1: same login, URL, title, and body assertions.
- Invalid-login and unauthenticated-redirect tests: unchanged.
- Dashboard: unchanged.
- Visual editor and login: unchanged snapshots.
- No test was removed, skipped, or renamed. No timeout changed.

## Evidence

Local, 2026-10-31, Windows 11, Node 24.13.0, Playwright 1.63.0, 1 worker, retries 0:

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npx playwright test --list` | 9 tests in 6 files |
| `npx playwright test --reporter=list` | 9 passed (47.2 s; WP1: 1.0 min) |
| `npm run test:ui` | 5 passed (27.0 s; setup + dashboard + 3 functional) |
| `npm run test:ui:functional` | 4 passed (21.1 s; WP1: 29.1 s) |
| `npm run test:cross` | 3 passed (20.6 s; WP1: 29.4 s) |
| `npm run test:visual` | 3 passed (15.7 s; snapshots unchanged) |
| `npx playwright test tests/ui --repeat-each=10` | 41 passed (3.8 min; WP1: 3.9 min) |
| `npm run test:api` | 15 requests / 53 assertions, 0 failed (6.5 s) |
| Absent `AUTH_EMAIL`/`AUTH_PASSWORD` setup run | 1 passed; session-local user created |
| `git check-ignore playwright/.auth/user.json` | ignored |

Metrics:

- Successful UI logins per full run: **5 → 1**.
- Invalid UI submissions: **1 → 1**.
- Setup UI logins: **1 → 0**.
- Dashboard in CI: **no → yes**.
- `test:ui` scope: **functional only → functional + dashboard**.

The full suite had no `404` cleanup warning. The 41-run repeat probe produced one expected `404` on UI article cleanup (public API read-after-delete inconsistency); the test still passed. The only other cleanup warnings are the expected `405` user-deletion messages.

## CI

CI evidence is pending the PR run. The public environment remains intermittent; failures will be recorded and the failed job rerun manually. No retries, sleeps, timeout increases, skips, or assertion changes were added.

## Rule checklist

- [x] No assertion lowered or removed.
- [x] No `test.skip`, `test.fixme`, `waitForTimeout`, or timeout increase.
- [x] No snapshot or visual threshold change.
- [x] Test count unchanged (9).
- [x] State file is gitignored.
- [x] At least one explicit UI login test remains.
- [x] Decision note added.
- [x] Before/after metrics recorded.
- [x] Typecheck passes before every commit.
- [x] No secrets committed.

## Open questions

1. The app-specific `jwtToken` key is now a named constant. If the RealWorld UI changes its storage contract, setup and dashboard will fail visibly; the key must be updated. The fallback is one UI login in setup (2 successful UI logins instead of 1).
2. The expected `405` user-deletion warning remains. Cleanup semantics are WP3.
3. The public app/API can still return a `404` during repeated cleanup. This is recorded as an environment issue, not hidden with retries.

## Follow-ups (not in this diff)

- WP3: cleanup semantics and the `405` warning.
- WP4: worker-scoped setup, parallelism, and public-API reliability.
- WP5: Linux visual baselines and CI.
