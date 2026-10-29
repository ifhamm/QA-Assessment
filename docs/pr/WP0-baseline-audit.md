# WP0: Baseline & Audit

## Summary

WP0 records the real baseline of `ifhamm/QA-Assessment` at `main` (`c5ec4f2`) before any behavior changes. It also applies a minimal, behavior-neutral CI auth unblock approved by the owner. It does **not** change tests, page objects, fixtures, API helpers, assertions, retries, timeouts, snapshots, or visual thresholds.

The good news: the repository is in better shape than the PRD assumes. Typecheck passes; the full local Playwright suite passes 9/9; the API collection passes 15 requests / 53 assertions; visual passes 2/2; k6 passes all thresholds; and the UI layer passed 41/41 under `--repeat-each=10`.

The main finding: **CI was red on `main` at baseline.** Run `38359351107` failed in `auth.setup.ts` because `AUTH_EMAIL` and `AUTH_PASSWORD` are required but the workflow only provided `BASE_URL` and `API_BASE_URL`. This PR fixes that specific blocker by supplying synthetic credentials in the Playwright job. It does not claim the suite is now stable: the shared public app/API intermittently returns 404/401 across replicas, so CI can still fail for environmental reasons.

## What changed

- Added `docs/PRD.md` (the working document, which was not in the repository).
- Added `docs/audit.md` — repository structure, README/PRD comparison, abstraction inventory, prioritized findings, post-audit CI evidence.
- Added `docs/metrics.md` — baseline counts, durations, flakiness, login counts, CI/reporting status, tooling health.
- Added `docs/decisions/WP0-baseline-audit.md` — decision note and owner decisions.
- Added `docs/progress.md` — WP tracker and blockers.
- Added this PR description file.
- Updated `.github/workflows/tests.yml` — the Playwright job now supplies synthetic `AUTH_EMAIL`/`AUTH_PASSWORD`, overridable with repository variables.
- Added `.env.example` — documents `BASE_URL`, `API_BASE_URL`, `AUTH_EMAIL`, and `AUTH_PASSWORD`.
- Updated `README.md` — documents the auth variables and the setup fallback.

`git diff --stat origin/main...wp0/baseline-audit` should show only docs, the workflow, `.env.example`, and `README.md`. No `tests/`, `pages/`, `fixtures/`, or `api/` file is touched.

## Why

The PRD explicitly says its description of the current state was written from the README and must be verified before changing anything. Verification showed that the repo has already moved ahead of the PRD (fixtures, auth setup, storage state, dashboard), while the pipeline is broken. Recording that honestly is more valuable than immediately "fixing" things and losing the baseline.

The CI unblock is deliberately minimal: it uses the setup fallback that already exists instead of changing test behavior. The root cause of the fallback contradiction remains for WP2.

## Baseline metrics

| Metric | Baseline |
| --- | --- |
| API | 15 requests / 53 assertions, 0 failed, 8.2 s |
| UI functional | 3 tests, green |
| UI dashboard | 1 test, green locally, **not in CI** |
| Cross-layer | 2 tests, green locally |
| Visual | 2 tests, green locally with Windows baselines, **not in CI** |
| k6 | 1 scenario, 150 iterations, 300 checks, all thresholds pass |
| Full Playwright suite | 9/9 passed, 1.3 min reported / 81.3 s wall |
| Clean-branch full suite after the unblock | 9/9 passed, 1.4 min reported / 88.0 s wall |
| UI `--repeat-each=10` | 41/41 passed, 0 flaky observed |
| UI logins per full run | 5 successful + 1 invalid submission; 8 API login calls |
| CI at baseline | **failure**, 39 s |
| CI (last green before WP0) | Playwright job 59 s, API job 14 s |

Full tables: `docs/metrics.md`.

## Key findings

### P0

1. **CI was red on `main`.** Run `38359351107`: `AUTH_EMAIL and AUTH_PASSWORD must be set for the authentication setup.` API job passed; Playwright job failed in setup; cross-layer was skipped. **Status:** auth-env blocker fixed in this PR.
2. **`.env.example` was missing.** The README tells users to `cp .env.example .env`. **Status:** fixed.
3. **The auth setup contradicts itself.** It throws when credentials are absent, so the fallback for absent credentials is unreachable. **Status:** mitigated in CI; root fix remains for WP2.

### P1

4. `dashboard.spec.ts` is not in CI. `test:ui` runs only `ui-functional.spec.ts`. **Status:** approved in principle, deferred to WP2/WP6 because it is a coverage change and exposed a public-app/auth-state flake.
5. UI logins are still repeated: the setup project logs in via UI, and cross-layer/visual tests log in individually. Intended CI run would do 5 successful UI logins + 1 invalid.
6. Cross-layer tests bypass the fixtures and duplicate registration/login/cleanup inline.
7. Cleanup is noisy: cross-layer update always logs a 404 for the old slug; UI tests log a 405 "user deletion not supported".
8. Visual tests are not protected by CI; baselines are Windows-only.
9. `test:ui` is narrower than its name; there is no script for the full UI layer.

### P2

One worker / no `fullyParallel`; no tags/sharding/merged report/quality gates; HTML-only reporting; two hardcoded 10 s waits; two CSS-class locators; public shared environment dependency; no lint.

### Environment finding

The public app/API is not strongly consistent. An API create returns `201`, and an `APIRequestContext` `GET /api/articles/:slug` returns `200`, while the browser's `GET` for the same slug returns `404` at the same time. During the CI investigation this caused intermittent failures in the API job, the cross-layer job, and the dashboard. The attempted cross-layer polling/UI-fixture changes were reverted because they belong in WP4 and do not make a shared public demo deterministic. Details and run IDs: `docs/audit.md` section 14.

## CI after the unblock

The setup project reached the tests, so the original P0 blocker is gone. The job is still not reliably green:

- `40908085383` (push) passed both jobs.
- `40908858571` (push) passed Playwright but failed the Newman article lifecycle with a 404.
- `40908872651` (pull_request) passed the API job but failed the dashboard because the authenticated "New Article" link was not visible within 5 s.
- `40908094021` (pull_request) passed the API job but failed cross-layer teardown because a fresh login got 401.

These are recorded as environment failures, not hidden with retries, sleeps, timeout increases, skips, or threshold changes. See `docs/audit.md` section 14 and `docs/metrics.md`.

## README vs reality

- `.env.example` was referenced but absent; now added.
- "Latest successful CI run" is stale; the latest baseline run failed, and CI remains environment-dependent.
- The project tree omits `fixtures/test-base.ts`, `tests/auth.setup.ts`, and `tests/ui/dashboard.spec.ts`.
- The docs did not mention `AUTH_EMAIL`/`AUTH_PASSWORD`, `storageState`, or the setup project; the auth variables are now documented.
- Everything else checked is accurate: API 15/53, UI functional 3, cross-layer 2, visual 2, k6 local, one worker, 1280x720, trace retained on failure, Windows visual baselines, CI artifact retention.

## PRD vs reality

The PRD assumes WP1/WP2 have not started. In reality:

- `fixtures/test-base.ts` already provides `api`, `loginPage`, `editorPage`, and `user` fixtures.
- `tests/auth.setup.ts` already produces `storageState`; `dashboard.spec.ts` uses it.
- Cross-layer still builds everything inline and is the main WP1/WP4 gap.
- The setup still logs in via UI, which is the WP2 gap.
- The repo has more coverage than the PRD's baseline (dashboard + auth setup) but less reliable CI.

## How to verify

```powershell
npm ci
npx playwright install chromium

# .env (ignored): BASE_URL, API_BASE_URL, synthetic AUTH_EMAIL/AUTH_PASSWORD

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

Expected: all local suites pass. CI starts successfully but may still fail because the public app/API is inconsistent.

Evidence:
- `docs/audit.md`
- `docs/metrics.md`
- CI run `38359351107` (baseline failure)
- CI run `40908085383` (one green post-unblock run)
- CI runs `40908858571` and `40908872651` (environment failures)

## Rule checklist

- [x] No test behavior changed.
- [x] No assertion lowered/removed.
- [x] No `test.skip`, `test.fixme`, `waitForTimeout`, snapshot update, or threshold change.
- [x] Decision note added.
- [x] Baseline metrics recorded.
- [x] Typecheck passes locally.
- [x] No secrets committed. `.env` is ignored; only synthetic values were used locally and in CI.
- [ ] CI reliably green — **not achieved; the public environment is intermittent. See the open question.**

## Open question

**How should CI handle the shared public app/API's read-after-write inconsistency?** Choose one:

1. Point CI at a stable self-hosted RealWorld instance.
2. Accept environment-dependent failures and rerun manually.
3. Approve a dedicated reliability WP with an explicit, visible retry/polling policy.

WP0 does not hide this with retries.

## Follow-ups (not in this diff)

- WP1: move cross-layer tests onto fixtures after approval.
- WP2: make the auth fallback usable when variables are absent; reduce repeated logins; dashboard auth state; cleanup visibility.
- WP4: cross-layer read-after-write reliability and parallel data isolation.
- WP5: Linux visual baselines and CI.
- WP6: dashboard/full-UI CI wiring, stages, sharding, merged report.
- WP9: update the README CI link and project tree.
