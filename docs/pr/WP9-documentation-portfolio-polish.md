## What changed

Documentation and portfolio pass (WP9), docs-only.

- `README.md`
  - CI badge, one-paragraph project summary, and a five-command quick start at the top.
  - "At a glance" table with the current suite and pipeline numbers.
  - Architecture diagram (suites → fixtures/data/auth setup → self-hosted stack).
  - "Before and after" table (WP0 baseline vs current `main`) with the latest green run.
  - Corrected coverage table (dashboard included) and project tree (scripts, auth setup, dashboard, docs index, metrics/progress).
  - Known limitations refreshed: retry-versus-stability, warning-only flaky handling, trace-link depth, opt-in sharding, WP8 scope.
- `docs/README.md` (new) — index of the PRD, progress, metrics, quality gates, audit, decision notes WP0–WP9, PR bodies, and evidence.
- `docs/audit.md` — post-WP9 status note for the stale CI link and the incomplete project tree; the audit stays a historical snapshot.
- `docs/progress.md` — WP9 tracker row and current state.
- Repository About — description and topics set through the GitHub API.

## Why

A reviewer could run the suite but could not see, in one screen, what it proves or where the evidence lives. The README's top was background rather than results, the docs had no index, the repository About was empty, and the WP0 audit still pointed at documentation gaps that no longer existed.

The WP9 brief: results summary, CI badge, architecture and pipeline diagrams, before/after metrics table, local run instructions, refreshed decisions and limitations, About section, and a docs index.

## Plan and approval

The plan was presented on 2026-11-14 and approved by the owner as written, including the repository About change. Branch cut from `main` at `05b4497`.

## How to verify

1. Follow the quick start from a clean clone: `npm ci`, `npx playwright install chromium`, `npm run stack:up`, `npm run test:local`, `npm run stack:down`.
2. `npm run typecheck`, `npm run lint`, `npm run check:tags` — all green locally.
3. `git diff --stat main` — only `README.md` and `docs/` changed; no test, workflow, or config edits.
4. Check the links: every relative link and anchor in the Markdown resolves.
5. Confirm the numbers against `docs/metrics.md` and the cited runs.

## Evidence

| Check | Result |
| --- | --- |
| Counts | 15 Newman requests / 53 assertions; 7 host Playwright runs (3 `@smoke`, 3 `@regression`, 1 setup); 2 visual tests; 8 CI jobs |
| Latest green `main` run | [`43562094955`](https://github.com/ifhamm/QA-Assessment/actions/runs/43562094955) — 2 m 56 s, 458 s summed job time |
| WP7 gate run | [`43559903310`](https://github.com/ifhamm/QA-Assessment/actions/runs/43559903310) — `Quality Gate` 11 s |
| Local checks | `typecheck`, `lint`, `check:tags` exit 0 |
| Link check | all relative links and anchors resolve |
| Diff scope | `README.md`, `docs/README.md`, `docs/audit.md`, `docs/progress.md`, `docs/decisions/WP9-*.md`, `docs/pr/WP9-*.md` |
| CI on this PR | full eight-job pipeline |

## Open questions

- The job-summary screenshot from a logged-in session and branch protection remain owner actions; neither blocks this PR.
- WP8 (negative tests, Firefox/WebKit smoke) is still optional and needs its own plan.

## Follow-ups (not in this diff)

- Add the logged-in summary screenshot to `docs/evidence/` when available.
- Configure branch protection on `main` (`Static Checks` + `Quality Gate`, up-to-date branches, no direct pushes).
