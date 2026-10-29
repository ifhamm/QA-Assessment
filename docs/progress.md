# Progress

Last updated: 2026-10-29

## Current state

- **Current work package:** WP0 — Baseline & Audit
- **Status:** deliverables complete; branch pushed; PR [#1](https://github.com/ifhamm/QA-Assessment/pull/1) opened for review. CI is expected to fail on the pre-existing auth-env problem.
- **Repository:** `https://github.com/ifhamm/QA-Assessment`
- **Audited baseline:** `main` at `c5ec4f22e4c037e1fc06243f9b2174f4cbeaea60`
- **Next work package:** WP1 — **not started**. It requires explicit owner approval (and a plan posted for approval before code changes).

## Work package tracker

| WP | Status | Branch / PR | Notes |
| --- | --- | --- | --- |
| WP0 | Complete, awaiting review | `wp0/baseline-audit` / [#1](https://github.com/ifhamm/QA-Assessment/pull/1) | Docs only. No test behavior changed. |
| WP1 | Not started | — | Requires explicit approval; plan must be approved before code. |
| WP2 | Not started | — | — |
| WP3 | Not started | — | Requires explicit approval; plan required before code. |
| WP4 | Not started | — | — |
| WP5 | Not started | — | — |
| WP6 | Not started | — | Requires explicit approval; plan required before code. |
| WP7 | Not started | — | — |
| WP8 | Not started | — | Optional/stretch. |
| WP9 | Not started | — | — |

## WP0 evidence

- [`docs/audit.md`](audit.md) — structure, README/PRD comparison, abstraction inventory, prioritized findings.
- [`docs/metrics.md`](metrics.md) — baseline test counts, durations, flakiness probe, login counts, CI/reporting status, tooling health.
- [`docs/decisions/WP0-baseline-audit.md`](decisions/WP0-baseline-audit.md) — decision note.
- [`docs/pr/WP0-baseline-audit.md`](pr/WP0-baseline-audit.md) — PR description.

## Baseline summary

- Local: typecheck passes; full Playwright suite 9/9; API 53/53 assertions; visual 2/2; k6 all thresholds pass.
- Flakiness probe: UI layer 41/41 under `--repeat-each=10`.
- CI: **red on `main`**. Latest run `38359351107` fails in `auth.setup.ts` because `AUTH_EMAIL`/`AUTH_PASSWORD` are not configured. Cross-layer is skipped.
- README: mostly accurate, but its "latest successful CI run" is stale, `.env.example` is missing, and the auth setup/dashboard are undocumented.
- The repo already contains partial WP1/WP2 work (fixtures, auth setup, storage state, dashboard). The next WP needs rescoping.

## Blockers / decisions needed

1. Fix the CI auth-env failure before or during WP1/WP2? This WP did not change it.
2. Add `dashboard.spec.ts` to CI?
3. Add the missing `.env.example`?
4. Confirm whether WP1/WP2 are considered partially done and how to rescope them.
5. Do not start WP1 until the owner explicitly approves it.
