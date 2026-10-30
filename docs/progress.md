# Progress

Last updated: 2026-10-29

## Current state

- **Current work package:** WP0 — Baseline & Audit
- **Status:** deliverables complete; branch `wp0/baseline-audit` is pushed and PR [#1](https://github.com/ifhamm/QA-Assessment/pull/1) is open for review. The branch contains the audit docs plus a minimal, behavior-neutral CI auth unblock.
- **CI:** the setup blocker is fixed, but the shared public app/API is intermittently inconsistent. CI has produced both a green and red run on equivalent changes. No retries, sleeps, or timeout increases were added. A policy decision is needed.
- **Repository:** `https://github.com/ifhamm/QA-Assessment`
- **Audited baseline:** `main` at `c5ec4f22e4c037e1fc06243f9b2174f4cbeaea60`
- **Next work package:** WP1 — **not started**. It requires explicit owner approval, and its plan must be approved before code changes.

## Work package tracker

| WP | Status | Branch / PR | Notes |
| --- | --- | --- | --- |
| WP0 | Complete, awaiting review | `wp0/baseline-audit` / [#1](https://github.com/ifhamm/QA-Assessment/pull/1) | Audit docs + minimal CI auth unblock. No test behavior changed. |
| WP1 | Not started | — | Requires explicit approval; plan must be approved before code. |
| WP2 | Not started | — | Rescope: auth fallback, login reuse, dashboard auth state, cleanup visibility. |
| WP3 | Not started | — | Requires explicit approval; plan required before code. |
| WP4 | Not started | — | Rescope: cross-layer fixture migration and public-API read-after-write reliability. |
| WP5 | Not started | — | Visual Linux baselines and CI. |
| WP6 | Not started | — | Requires explicit approval; plan required before code. |
| WP7 | Not started | — | — |
| WP8 | Not started | — | Optional/stretch. |
| WP9 | Not started | — | README CI link, project tree, remaining docs. |

## WP0 evidence

- [`docs/audit.md`](audit.md) — structure, README/PRD comparison, abstraction inventory, prioritized findings, post-audit CI evidence.
- [`docs/metrics.md`](metrics.md) — baseline test counts, durations, flakiness probe, login counts, CI/reporting status, tooling health, post-unblock CI observations.
- [`docs/decisions/WP0-baseline-audit.md`](decisions/WP0-baseline-audit.md) — decision note and owner decisions.
- [`docs/pr/WP0-baseline-audit.md`](pr/WP0-baseline-audit.md) — PR description.

## Baseline summary

- Local: typecheck passes; full Playwright suite 9/9; API 53/53 assertions; visual 2/2; k6 all thresholds pass.
- Flakiness probe: UI layer 41/41 under `--repeat-each=10`.
- CI at baseline: **red on `main`** (run `38359351107`). Setup failed because `AUTH_EMAIL`/`AUTH_PASSWORD` were not configured; cross-layer was skipped.
- CI after the auth unblock: setup now starts, but the public app/API intermittently returns 404/401 across replicas. One push run passed both jobs; other runs failed in API, cross-layer, or dashboard. See `docs/audit.md` section 14.
- README: mostly accurate, but its "latest successful CI run" is stale, the project tree is incomplete, and the auth setup/dashboard were undocumented.
- The repo already contains partial WP1/WP2 work (fixtures, auth setup, storage state, dashboard). The next WP needs rescoping.

## Blockers / decisions needed

1. **CI policy for the shared public environment.** Choose one: (a) point CI at a stable self-hosted RealWorld instance, (b) accept environment-dependent failures and rerun manually, or (c) approve a reliability WP with an explicit, visible retry/polling policy. WP0 does not hide the flake.
2. Confirm the WP1 rescope plan before code changes. WP1/WP2 are partially implemented; do not redo existing fixtures or auth setup.
3. Confirm the WP2 scope: root auth fallback, login reuse, dashboard auth state, and cleanup visibility.
4. Confirm the WP5 scope: Linux visual baselines and CI integration.
5. Do not start WP1 until the owner explicitly approves it.
