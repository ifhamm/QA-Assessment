# WP1: Fixtures & Abstraction Boundaries

## Summary

This PR finishes the fixture layer that already existed on `main` and removes the duplicated setup from the cross-layer tests. It is refactor-only: the number of tests (9), the assertions, the timeouts, the retries, and the snapshots are unchanged.

## What changed

- `fixtures/test-base.ts`
  - Added `articlePage` and `navBar` fixtures.
  - Added an `article` fixture that creates one article through the API and deletes it in teardown, even when the test fails.
  - The article's `slug` is mutable so the UI-update test can point cleanup at the renamed article.
- `tests/cross-layer/cross-layer.spec.ts`
  - Removed inline registration, API logins, article creation, and `try/finally` cleanup.
  - Both tests now consume the user, article, and page-object fixtures. Assertions are identical.
- `tests/ui/ui-functional.spec.ts`
  - Uses the `articlePage` and `navBar` fixtures instead of `new`.
  - Keeps its own article cleanup because the article is created through the UI.
- `docs/decisions/WP1-fixtures-abstraction-boundaries.md` — decision note.
- `docs/metrics.md`, `docs/progress.md` — after-metrics and tracker update.

## Why

WP0 found that fixtures existed but were only used by one spec, while the cross-layer tests rebuilt the same setup inline. The goal is that setup and teardown are owned by fixtures, and that every abstraction has a stated reason to exist.

While migrating, cleanup started returning `401`. The public API replaces the user's token on every login, so a token from registration is stale after a UI login. Cleanup logs in again before deleting. The original "duplicate" login calls were required by the API; they are now centralized in the fixture and explained in the decision note.

## Assertion parity

- Cross-layer test 1: same URL assertion and the same title/body assertions.
- Cross-layer test 2: same initial value, redirect, title, and API title/body assertions.
- UI functional test 1: same login, URL, title, and body assertions.
- No test was removed, skipped, or renamed. No timeout changed.

## Evidence

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npx playwright test --list` | 9 tests in 6 files |
| `npx playwright test --reporter=list` | 9 passed (1.0 min) |
| Full suite before WP1 (merged `main`) | 9 passed (1.2 min) |
| `npm run test:cross` | 3 passed (29.4 s; baseline 40.4 s) |
| `npm run test:ui` | 4 passed (29.1 s; baseline 29.6 s) |
| `npx playwright test tests/ui --repeat-each=10` | see `docs/metrics.md` |
| Expected `404` cleanup warning | removed |
| API login calls per full run | 8 → 6 |

The only remaining cleanup warning is the expected `405` user-deletion message; the public API has no user-deletion endpoint.

## How to verify

```powershell
npm run typecheck
npx playwright test --list
npx playwright test --reporter=list
npx playwright test tests/ui --repeat-each=10 --reporter=list
git diff --stat main...wp1/fixtures-abstraction-boundaries
```

## Rule checklist

- [x] No assertion lowered or removed.
- [x] No `test.skip`, `test.fixme`, `waitForTimeout`, or timeout increase.
- [x] No snapshot or visual threshold change.
- [x] Test count unchanged (9).
- [x] Decision note added.
- [x] Before/after metrics recorded.
- [x] Typecheck passes before every commit.
- [x] No secrets committed.

## Open questions

1. CI policy for the shared public app/API is still open (accept + rerun manually was chosen for WP1). CI may fail for environment reasons; failures will be recorded, not hidden.
2. Should the `405` user-cleanup warning be silenced or surfaced differently? Proposed for WP3.

## Follow-ups (not in this diff)

- WP2: `storageState`, fewer UI logins, usable auth fallback.
- WP3: user-cleanup visibility, unused `ArticlePage` locators.
- WP4: worker-scoped setup, reliability, parallelism.
- WP5: visual baselines in Linux/CI.
