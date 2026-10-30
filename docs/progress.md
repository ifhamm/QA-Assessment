# Progress

Last updated: 2026-10-31

## Current state

- **Current work package:** WP1 — Fixtures & Abstraction Boundaries (owner-approved plan).
- **Status:** implementation complete locally on `wp1/fixtures-abstraction-boundaries`; PR not opened yet.
- **CI policy:** for WP1, environment-dependent failures are accepted and failed jobs are rerun manually (option b in `docs/audit.md` section 12). No retries, sleeps, or timeout increases.
- **Repository:** `https://github.com/ifhamm/QA-Assessment`
- **Baseline:** WP0 merged to `main` as `5364f30` (PR [#1](https://github.com/ifhamm/QA-Assessment/pull/1)).
- **Next work package:** WP2 — **not started**. Rescope required; plan and approval before code.

## Work package tracker

| WP | Status | Branch / PR | Notes |
| --- | --- | --- | --- |
| WP0 | Complete, merged | `wp0/baseline-audit` / [#1](https://github.com/ifhamm/QA-Assessment/pull/1) | Merged as `5364f30` on 2026-10-30. Audit docs + minimal CI auth unblock. No test behavior changed. |
| WP1 | Complete locally, PR pending | `wp1/fixtures-abstraction-boundaries` | Fixtures completed; 3 tests migrated; expected `404` cleanup removed. No assertion changes. |
| WP2 | Not started | — | Rescope: auth fallback, login reuse, dashboard auth state, cleanup visibility. |
| WP3 | Not started | — | Requires explicit approval; plan required before code. |
| WP4 | Not started | — | Rescope: cross-layer fixture migration and public-API read-after-write reliability. |
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

## Baseline summary

- Local: typecheck passes; full Playwright suite 9/9; API 53/53 assertions; visual 2/2; k6 all thresholds pass.
- Flakiness probe: UI layer 41/41 under `--repeat-each=10`.
- CI at baseline: **red on `main`** (run `38359351107`). Setup failed because `AUTH_EMAIL`/`AUTH_PASSWORD` were not configured; cross-layer was skipped.
- CI after the auth unblock: setup now starts, but the public app/API intermittently returns 404/401 across replicas. One push run passed both jobs; other runs failed in API, cross-layer, or dashboard. See `docs/audit.md` section 14.
- README: mostly accurate, but its "latest successful CI run" is stale, the project tree is incomplete, and the auth setup/dashboard were undocumented.
- The repo already contains partial WP1/WP2 work (fixtures, auth setup, storage state, dashboard). The next WP needs rescoping.

## WP1 summary

- Fixtures now cover `api`, `loginPage`, `editorPage`, `articlePage`, `navBar`, `user`, and `article`.
- Three tests migrated: both cross-layer tests and the UI create test. Assertions unchanged.
- The `article` fixture owns API setup/teardown; the UI create test keeps its cleanup because the article is created through the UI.
- The public API replaces the user's token on every login, so cleanup logs in again before deleting. No retries or sleeps.
- Local: typecheck passes; 9/9 full suite (1.0 min); cross-layer 29.4 s; UI functional 29.1 s; no `404` cleanup warning.
- CI: PR not opened yet. Environment-dependent failures are expected and will be rerun manually.

## Blockers / decisions needed

1. **WP1 PR.** Open it, review the diff, and compare the CI run. CI may be red because of the shared public environment; rerun the failed job manually.
2. **WP2 scope.** Confirm: root auth fallback, login reuse via `storageState`, dashboard auth state, and cleanup visibility.
3. **WP5 scope.** Confirm: Linux visual baselines and CI integration.
4. **Do not start WP2 until the owner explicitly approves it.**
5. **CI policy (resolved for WP1).** Accept environment-dependent failures and rerun failed jobs manually. Revisit a stable test target if the failure frequency rises.
