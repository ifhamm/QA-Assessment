# Progress

Last updated: 2026-11-12

## Current state

- **Current work package:** WP5 complete and merged; docs follow-up is the only open item. WP6 requires explicit approval and a plan before code.
- **Status:** WP5 merged to `main` as `068f56a` (PR [#7](https://github.com/ifhamm/QA-Assessment/pull/7)) on 2026-11-02. Visual tests render only in `mcr.microsoft.com/playwright:v1.63.0-noble`; Windows baselines were removed. Post-merge `main` CI [run `41469719183`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469719183) is green (2 m 09 s; API 1 m 14 s, Playwright 1 m 55 s, Visual 1 m 49 s). The PR run [`41469698058`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469698058) was green in 1 m 51 s, and the intentional-failure experiment [`41466501007`](https://github.com/ifhamm/QA-Assessment/actions/runs/41466501007) failed only the Visual job.
- **CI policy:** local stability evidence uses `retries: 0`. CI uses one retry with `on-first-retry` tracing as an infrastructure safety net; failures are recorded honestly and failed jobs are rerun manually, never hidden with sleeps, skips, timeout inflation, or assertion changes.
- **Repository:** `https://github.com/ifhamm/QA-Assessment`
- **Baseline:** WP5 merged to `main` as `068f56a` (PR [#7](https://github.com/ifhamm/QA-Assessment/pull/7)); WP4 merged as `494d243` (PR [#5](https://github.com/ifhamm/QA-Assessment/pull/5)); WP3 merged as `3fffa6f` (PR [#4](https://github.com/ifhamm/QA-Assessment/pull/4)); WP2 merged as `90e66ec` (PR [#3](https://github.com/ifhamm/QA-Assessment/pull/3)); WP1 merged as `e74a82d` (PR [#2](https://github.com/ifhamm/QA-Assessment/pull/2)); WP0 merged as `5364f30` (PR [#1](https://github.com/ifhamm/QA-Assessment/pull/1)).
- **Next work package:** WP6 — requires explicit owner approval and a written plan before implementation.

## Work package tracker

| WP | Status | Branch / PR | Notes |
| --- | --- | --- | --- |
| WP0 | Complete, merged | `wp0/baseline-audit` / [#1](https://github.com/ifhamm/QA-Assessment/pull/1) | Merged as `5364f30` on 2026-10-30. Audit docs + minimal CI auth unblock. No test behavior changed. |
| WP1 | Complete, merged | `wp1/fixtures-abstraction-boundaries` / [#2](https://github.com/ifhamm/QA-Assessment/pull/2) | Merged as `e74a82d` on 2026-10-30. Fixtures completed; 3 tests migrated; expected `404` cleanup removed. No assertion changes. |
| WP2 | Complete, merged | `wp2/reuse-auth-state` / [#3](https://github.com/ifhamm/QA-Assessment/pull/3) | Merged as `90e66ec` on 2026-10-31. API-built storage state, per-test token injection, dashboard in CI, `test:ui` naming. |
| WP3 | Complete, merged | `wp3/test-data-architecture` / [#4](https://github.com/ifhamm/QA-Assessment/pull/4) | Merged as `3fffa6f` on 2026-11-01. Worker-aware data factories, fixture-owned best-effort cleanup, `--grep` and `--fully-parallel` evidence, found the public API's global token defect. CI: main push green; PR run red (environment). |
| WP4 | Complete, merged | `wp4/parallelism-reliability` / [#5](https://github.com/ifhamm/QA-Assessment/pull/5) | Merged as `494d243` on 2026-11-02. Self-hosted pinned RealWorld stack, 4 workers with `fullyParallel`, CI-only retry/trace, locator strict-mode fix. CI green on branch push/PR/main; API 1 m 57 s, Playwright 1 m 58 s on `main`. Docs follow-up: [#6](https://github.com/ifhamm/QA-Assessment/pull/6). |
| WP5 | Complete, merged | `wp5/visual-linux-ci` / [#7](https://github.com/ifhamm/QA-Assessment/pull/7) | Merged as `068f56a` on 2026-11-02. Pinned Playwright container for visual tests, Linux baselines replace Windows, separate CI job, failure artifact. PR run [`41469698058`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469698058) green; post-merge `main` run [`41469719183`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469719183) green; intentional failure [`41466501007`](https://github.com/ifhamm/QA-Assessment/actions/runs/41466501007). Docs: [`decisions/WP5-visual-linux-ci.md`](decisions/WP5-visual-linux-ci.md). |
| WP6 | Not started | — | Requires explicit approval; plan required before code. |
| WP7 | Not started | — | — |
| WP8 | Not started | — | Optional/stretch. |
| WP9 | Not started | — | README CI link, project tree, remaining docs. |

## Evidence

### WP0

- [`docs/audit.md`](audit.md) — structure, README/PRD comparison, abstraction inventory, prioritized findings, post-audit CI evidence.
- [`docs/metrics.md`](metrics.md) — baseline test counts, durations, flakiness probe, login counts, CI/reporting status, tooling health, post-unblock CI observations.
- [`docs/decisions/WP0-baseline-audit.md`](decisions/WP0-baseline-audit.md) — decision note and owner decisions.
- [`docs/pr/WP0-baseline-audit.md`](pr/WP0-baseline-audit.md) — PR description.

### WP1

- [`docs/decisions/WP1-fixtures-abstraction-boundaries.md`](decisions/WP1-fixtures-abstraction-boundaries.md) — fixture boundaries, `beforeEach` vs test vs worker fixtures, token rotation finding.
- [`docs/pr/WP1-fixtures-abstraction-boundaries.md`](pr/WP1-fixtures-abstraction-boundaries.md) — PR description, assertion parity, evidence.
- [`docs/metrics.md`](metrics.md) — WP1 after-metrics section.
- PR [#2](https://github.com/ifhamm/QA-Assessment/pull/2), merge commit `e74a82d`.
- Merged `main` push run [41102844151](https://github.com/ifhamm/QA-Assessment/actions/runs/41102844151) — **SUCCESS**, both jobs.
- PR run [41102377226](https://github.com/ifhamm/QA-Assessment/actions/runs/41102377226) — **SUCCESS**, both jobs.

### WP2

- [`docs/decisions/WP2-reuse-auth-state.md`](decisions/WP2-reuse-auth-state.md) — auth modes, API-built storage state, per-test token injection, trade-offs.
- [`docs/pr/WP2-reuse-auth-state.md`](pr/WP2-reuse-auth-state.md) — PR description, assertion parity, evidence.
- [`docs/metrics.md`](metrics.md) — WP2 before/after section.

### WP3

- [`docs/decisions/WP3-test-data-architecture.md`](decisions/WP3-test-data-architecture.md) — worker-aware factories, best-effort cleanup, the `405` decision, and the API identity probe.
- [`docs/pr/WP3-test-data-architecture.md`](pr/WP3-test-data-architecture.md) — PR description.
- [`docs/metrics.md`](metrics.md) — WP3 isolation evidence and API probes.
- PR [#4](https://github.com/ifhamm/QA-Assessment/pull/4), merge commit `3fffa6f`.
- PR run [41305629458](https://github.com/ifhamm/QA-Assessment/actions/runs/41305629458) — **failure**: Playwright job passed UI but failed cross-layer; API job failed. Recorded as the known public-environment failure, not hidden.
- Merged `main` push run [41305646205](https://github.com/ifhamm/QA-Assessment/actions/runs/41305646205) — **SUCCESS**, both jobs (API 14 s, Playwright 52 s), commit `3fffa6f`.

### WP4

- [`docs/decisions/WP4-parallelism-reliability.md`](decisions/WP4-parallelism-reliability.md) — options, self-hosted stack, API contract patch, locator audit, trade-offs, and evidence.
- [`docs/pr/WP4-parallelism-reliability.md`](pr/WP4-parallelism-reliability.md) — PR description.
- [`docs/metrics.md`](metrics.md) — WP4 before/after, 1/2/4-worker benchmark, 10-run table, repeat probe, and API identity probe.
- Local: `npm run typecheck` exit 0; `npm run test:local` 9/9 at 4 workers; 10/10 consecutive 4-worker runs with retries disabled; UI `--repeat-each=10` 41/41 in 37.2 s; local API identity probe 0/6 mismatches; `npm run test:api:local` 15 requests / 53 assertions, 0 failed.
- CI: PR [#5](https://github.com/ifhamm/QA-Assessment/pull/5) merged as `494d243`; branch push, PR, and `main` runs all green on the first attempt (API 1 m 57 s, Playwright 1 m 58 s on `main`). The workflow builds the self-hosted stack in both jobs and no longer reads repository variables.

### WP5

- [`docs/decisions/WP5-visual-linux-ci.md`](decisions/WP5-visual-linux-ci.md) — instability sources, options, container decision, baseline rules, trade-offs, and evidence.
- [`docs/metrics.md`](metrics.md) — WP5 before/after table, local evidence (7 host + 2 visual, repeat probe 10/10), and CI runs.
- [`.github/workflows/tests.yml`](../.github/workflows/tests.yml) — separate `Visual Tests` job; `visual-diffs` artifact on failure.
- [`docker-compose.yml`](../docker-compose.yml) — `visual` profile in `mcr.microsoft.com/playwright:v1.63.0-noble`, reaching the app as `http://web`.
- [`playwright.config.ts`](../playwright.config.ts) — `visual` project, fixed light/UTC/en-US rendering, explicit disabled animations; thresholds unchanged.
- [`tests/visual/`](../tests/visual) — `*-visual-linux.png` baselines; Windows baselines removed.
- Green CI: [run `41466040923`](https://github.com/ifhamm/QA-Assessment/actions/runs/41466040923) on `7045feb` (2 m 24 s; API 1 m 08 s, Playwright 2 m 14 s, Visual 1 m 50 s; `2 passed (1.9s)`, no retry).
- Intentional failure: [run `41466501007`](https://github.com/ifhamm/QA-Assessment/actions/runs/41466501007) on experiment commit `7254cb3`; only `Visual Tests` failed (1 m 49 s), and the `visual-diffs` artifact contained expected/actual/diff images.
- Committed evidence: [`wp5-intentional-failure-diff.png`](evidence/wp5-intentional-failure-diff.png) and [`wp5-intentional-failure-actual.png`](evidence/wp5-intentional-failure-actual.png).
- Merged: PR [#7](https://github.com/ifhamm/QA-Assessment/pull/7) as `068f56a` on 2026-11-02. PR run [`41469698058`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469698058) green (1 m 51 s); post-merge `main` run [`41469719183`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469719183) green (2 m 09 s; Visual 1 m 49 s).

## Baseline summary

- Local: typecheck passes; full Playwright suite 9/9; API 53/53 assertions; visual 2/2; k6 all thresholds pass.
- Flakiness probe: UI layer 41/41 under `--repeat-each=10`.
- CI at baseline: **red on `main`** (run `38359351107`). Setup failed because `AUTH_EMAIL`/`AUTH_PASSWORD` were not configured; cross-layer was skipped.
- CI after the auth unblock: setup now starts, but the public app/API intermittently returns 404/401 across replicas. One push run passed both jobs; other runs failed in API, cross-layer, or dashboard. See `docs/audit.md` section 14.
- README: mostly accurate, but its "latest successful CI run" is stale, the project tree is incomplete, and the auth setup/dashboard were undocumented.
- WP2 is rescoped and approved: auth fallback, API-built storage state, per-test token injection, dashboard in CI, and `test:ui` naming.

## WP1 summary

- Fixtures now cover `api`, `loginPage`, `editorPage`, `articlePage`, `navBar`, `user`, and `article`.
- Three tests migrated: both cross-layer tests and the UI create test. Assertions unchanged.
- The `article` fixture owns API setup/teardown; the UI create test keeps its cleanup because the article is created through the UI.
- The public API replaces the user's token on every login, so cleanup logs in again before deleting. No retries or sleeps.
- Local: typecheck passes; 9/9 full suite (1.0 min); cross-layer 29.4 s; UI functional 29.1 s; no `404` cleanup warning.
- CI: merged `main` push run `41102844151` is green; PR run `41102377226` is green. The earlier branch push run `41100533592` failed the API job for the known public-environment reason; it was not hidden with retries.

## WP2 summary

- Merged to `main` as `90e66ec` (PR [#3](https://github.com/ifhamm/QA-Assessment/pull/3)) on 2026-10-31.
- `auth.setup.ts` builds `storageState` from an API token; it no longer performs a UI login and no longer throws when `AUTH_EMAIL`/`AUTH_PASSWORD` are absent.
- A new `authenticatedPage` fixture injects the per-test user's JWT into `localStorage`. Cross-layer and visual editor tests use it instead of UI logins.
- The UI create test remains the explicit login-flow test; the invalid-login test is unchanged.
- Dashboard is now part of `test:ui` and therefore CI. `test:ui:functional` preserves the old focused command.
- Local: typecheck passes; 9/9 full suite (47.2 s); `test:ui` 5/5 (27.0 s); `test:ui:functional` 4/4 (21.1 s); cross-layer 3/3 (20.6 s); visual 3/3 (15.7 s); repeat probe 41/41 (3.8 min).
- Successful UI logins per full run: 5 → 1; invalid submissions remain 1.
- The expected `405` user-deletion warnings remain; cleanup semantics are WP3. The full suite had no `404` cleanup warning; the repeat probe produced one public-environment `404` that did not fail the test.
- CI evidence is pending the PR run.

## WP3 summary

- `tests/test-data.ts` is now worker-aware: a per-process random run id, a visible worker-index label, and a monotonic counter make identifier collisions impossible across tests and workers; the `user` fixture, `auth.setup.ts`, and UI tests all use the factories.
- Fixtures own the lifecycle uniformly: setup via API → test → best-effort cleanup via API through `tests/cleanup.ts`, which logs failures without replacing the test result.
- The `405` user-deletion warning stays one per attempted deletion; deduplication was rejected because it hides the real leak count. The setup user remains infrastructure and is not deleted (no endpoint).
- The UI create test still owns its article (created through the UI) and now recovers the slug from the URL when the redirect assertion fails, so a published article is still deleted.
- Evidence: 9/9 tests pass alone via `--grep`; 9/9 with `--fully-parallel --workers=1` (1.0 min) and `--fully-parallel --workers=2` (59.4 s); repeat probe 41/41 (5.2 min); typecheck passes; API suite 53/53 assertions.
- 4-worker runs (7/9 and 8/9) failed because the public API rotates **other users'** tokens on registration/login — verified with a direct API probe: 6/8 concurrent registration tokens resolved to a different user, and sequential earlier tokens became `401`. This is recorded as a public-environment defect, not a data collision; no retries, sleeps, or worker changes were made.
- Defaults unchanged (`fullyParallel: false`, `workers: 1`, `retries: 0`); WP4 flipped them to `fullyParallel: true`, `workers: 4`, with CI-only retries.
- CI: PR run `41305629458` failed (Playwright cross-layer + API) while the merged `main` push run `41305646205` passed both jobs at `3fffa6f`. Both runs are recorded; the PR failure is consistent with the public-environment behavior above and was not retried or hidden.

## WP4 summary

- Chose to self-host the stack (Angular frontend pinned to `ea0dd03`, Nitro API pinned to `c8c6685`, nginx same-origin `/api` proxy). The database is disposable via `docker compose down -v`.
- Patched the backend to check article ownership before body validation and return `404` for a non-owner, matching the target contract the existing Postman assertions use. This is a documented test-infrastructure patch.
- Fixed a strict-mode locator bug in `NavBar` (scoped to `navigation`; username also exists as an article author link). Updated dashboard and visual editor tests to use `NavBar` helpers.
- Enabled `fullyParallel: true`, `workers: 4`, `retries: 0` locally, `1` in CI with `trace: "on-first-retry"`. CI now builds the stack in both jobs and no longer uses repository variables.
- Local evidence: typecheck passes; 20/20 four-worker runs green across two independent 10-run batches (no retries); UI `--repeat-each=10` 41/41 (37.2 s warm; 1.0 min after Docker restart); local API identity probe 0/6 mismatches; Newman 15/53, 0 failed; `waitForTimeout` 0 in Playwright code.
- PR [#5](https://github.com/ifhamm/QA-Assessment/pull/5) merged as `494d243` on 2026-11-02. CI was green on the first attempt on the branch push ([`41462038159`](https://github.com/ifhamm/QA-Assessment/actions/runs/41462038159), 1 m 49 s), the PR ([`41462371220`](https://github.com/ifhamm/QA-Assessment/actions/runs/41462371220), 2 m 04 s), and `main` ([`41462400575`](https://github.com/ifhamm/QA-Assessment/actions/runs/41462400575), 2 m 04 s: API 1 m 57 s, Playwright 1 m 58 s). No retry was consumed. PR [#5](https://github.com/ifhamm/QA-Assessment/pull/5) now carries the WP4 title and description; the docs follow-up is PR [#6](https://github.com/ifhamm/QA-Assessment/pull/6).

## WP5 summary

- Visual tests now render only in `mcr.microsoft.com/playwright:v1.63.0-noble`, the same image that created the baselines. The compose `visual` service joins the stack network and reaches the app at `http://web`; no host ports or host fonts are involved.
- The old `*-chromium-win32.png` baselines were deleted and replaced by `*-visual-linux.png`. Keeping both would create two sources of truth; a Windows-only green would no longer imply CI green.
- The `visual` Playwright project is separate from `setup`/`authenticated`/`chromium`. `npm test` and `npm run test:local` run the 7 host tests; `npm run test:visual` runs the 2 container-rendered tests. `test:visual:linux:update` regenerates baselines in the same image.
- Screenshot inputs are fixed: 1280x720 viewport, light color scheme, UTC, `en-US`, explicitly disabled animations, and a width-stabilized/masked username on the editor page. Diff thresholds remain the Playwright defaults and were not loosened.
- CI has a separate `Visual Tests` job. On failure it uploads `test-results/` and `playwright-report/` as `visual-diffs`, containing expected, actual, and diff images.
- Local evidence: typecheck exit 0; 7/7 host tests (19.6 s); 2/2 visual tests (7.4 s); `--repeat-each=5` 10/10 (23.4 s).
- CI evidence: branch run [`41466040923`](https://github.com/ifhamm/QA-Assessment/actions/runs/41466040923) green in 2 m 24 s with no retry. Experiment run [`41466501007`](https://github.com/ifhamm/QA-Assessment/actions/runs/41466501007) failed only the Visual job and uploaded a visible diff; the images are committed under `docs/evidence/`.
- Merged to `main` as `068f56a` via PR [#7](https://github.com/ifhamm/QA-Assessment/pull/7) on 2026-11-02. The PR run [`41469698058`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469698058) was green in 1 m 51 s, and the post-merge `main` run [`41469719183`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469719183) was green in 2 m 09 s (API 1 m 14 s, Playwright 1 m 55 s, Visual 1 m 49 s). PR #7 now has the WP5 title and description.

## Blockers / decisions needed

1. **WP3 PR description is empty.** The PR is merged, but [#4](https://github.com/ifhamm/QA-Assessment/pull/4) has no description and its title is the default `Wp3/test data architecture`. Paste `docs/pr/WP3-test-data-architecture.md` into the merged PR (and retitle it `WP3: Test Data Architecture`) in the GitHub UI so the merge history satisfies the DoD.
2. **WP5 docs follow-up.** PR [#8](https://github.com/ifhamm/QA-Assessment/pull/8) records the merge and post-merge CI; merge it after review. WP5 PR [#7](https://github.com/ifhamm/QA-Assessment/pull/7) now has its title and description.
3. **WP6 scope and approval.** WP6 (staged CI pipeline and sharding) requires explicit owner approval and a written plan before any code.
4. **CI policy (resolved for WP1–WP5).** Accept environment-dependent failures and rerun failed jobs manually. Local stability is proven without retries; CI has a single retry with first-retry tracing. WP5's visual job passed without consuming the retry.
