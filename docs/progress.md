# Progress

Last updated: 2026-10-31

## Current state

- **Current work package:** WP2 — Reuse Auth State (owner-approved plan, 2026-10-31).
- **Status:** implementation complete locally on `wp2/reuse-auth-state`; PR not opened yet.
- **CI policy:** environment-dependent failures are accepted and failed jobs are rerun manually (option b in `docs/audit.md` section 12). No retries, sleeps, or timeout increases.
- **Repository:** `https://github.com/ifhamm/QA-Assessment`
- **Baseline:** WP1 merged to `main` as `e74a82d` (PR [#2](https://github.com/ifhamm/QA-Assessment/pull/2)); WP0 merged as `5364f30` (PR [#1](https://github.com/ifhamm/QA-Assessment/pull/1)).
- **Next work package:** WP3 — **not started**. Plan and approval required before code.

## Work package tracker

| WP | Status | Branch / PR | Notes |
| --- | --- | --- | --- |
| WP0 | Complete, merged | `wp0/baseline-audit` / [#1](https://github.com/ifhamm/QA-Assessment/pull/1) | Merged as `5364f30` on 2026-10-30. Audit docs + minimal CI auth unblock. No test behavior changed. |
| WP1 | Complete, merged | `wp1/fixtures-abstraction-boundaries` / [#2](https://github.com/ifhamm/QA-Assessment/pull/2) | Merged as `e74a82d` on 2026-10-30. Fixtures completed; 3 tests migrated; expected `404` cleanup removed. No assertion changes. |
| WP2 | In progress | `wp2/reuse-auth-state` | Auth fallback, API-built storage state, per-test token injection, dashboard in CI, `test:ui` naming. |
| WP3 | Not started | — | Requires explicit approval; plan required before code. |
| WP4 | Not started | — | Parallelism, worker-scoped setup, and public-API read-after-write reliability. |
| WP5 | Not started | — | Visual Linux baselines and CI. |
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

- `auth.setup.ts` builds `storageState` from an API token; it no longer performs a UI login and no longer throws when `AUTH_EMAIL`/`AUTH_PASSWORD` are absent.
- A new `authenticatedPage` fixture injects the per-test user's JWT into `localStorage`. Cross-layer and visual editor tests use it instead of UI logins.
- The UI create test remains the explicit login-flow test; the invalid-login test is unchanged.
- Dashboard is now part of `test:ui` and therefore CI. `test:ui:functional` preserves the old focused command.
- Local: typecheck passes; 9/9 full suite (47.2 s); `test:ui` 5/5 (27.0 s); `test:ui:functional` 4/4 (21.1 s); cross-layer 3/3 (20.6 s); visual 3/3 (15.7 s); repeat probe 41/41 (3.8 min).
- Successful UI logins per full run: 5 → 1; invalid submissions remain 1.
- The expected `405` user-deletion warnings remain; cleanup semantics are WP3. The full suite had no `404` cleanup warning; the repeat probe produced one public-environment `404` that did not fail the test.
- CI evidence is pending the PR run.

## Blockers / decisions needed

1. **WP2 PR.** Implementation is complete locally. Open the PR using `docs/pr/WP2-reuse-auth-state.md` and wait for both checks before merging.
2. **WP3 scope.** Confirm cleanup semantics, the expected `405` user-deletion warning, and unused `ArticlePage` locators.
3. **WP5 scope.** Confirm Linux visual baselines and CI integration.
4. **Do not start WP3 until the owner explicitly approves it.**
5. **CI policy (resolved for WP1/WP2).** Accept environment-dependent failures and rerun failed jobs manually. Revisit a stable test target if the failure frequency rises.
