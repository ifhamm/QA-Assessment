# WP9 — Documentation & Portfolio Polish

Date: 2026-11-14
Branch: `wp9/docs-portfolio-polish`
Base: `main` at `05b4497` (WP7 merge plus the WP6/WP7 docs record)

## Problem

The repository had an accurate but hard-to-navigate record. The README described
the suite well after WP4–WP7, but a reviewer arriving at the repository had to
scroll past prerequisites to find out what the project proves, and there was no
single place that linked the audit, metrics, policy, decision notes, PR bodies,
and evidence. The repository About section was empty, and the project tree was
last completed in WP0, before `fixtures/`, `tests/auth.setup.ts`,
`scripts/ci-summary.mjs`, and the documentation index existed.

The WP9 brief asks for a results summary at the top of the README, a CI badge,
architecture and pipeline diagrams, a before/after metrics table, local run
instructions, refreshed design decisions and limitations, a repository About
section, and an index under `docs/`.

## Options

1. **Rewrite the README from scratch.** Cleaner prose, but it would discard
   evidence-backed history and risk reintroducing claims that do not match the
   repository. Rejected.
2. **Surgical update of the existing README plus a new index.** Keeps the
   verified WP1–WP7 narrative, adds the missing top-level summary, diagrams,
   metrics table, and navigation. Chosen.
3. **Put the index at `docs/index.md`.** A dedicated file is explicit, but
   GitHub renders `docs/README.md` automatically when a visitor opens the
   directory, so it is one click fewer and cannot be missed. `docs/README.md`
   chosen.
4. **Mermaid for both diagrams.** The pipeline diagram is already proven to
   render as ASCII and is quoted in several notes. Mermaid is used only for the
   architecture view; the pipeline stays ASCII. Chosen to avoid churn in the
   text other documents quote.

## What changed

- `README.md`
  - CI badge for `tests.yml` on `main`, a one-paragraph project summary, and a
    five-command quick start at the top.
  - "At a glance" table with the current suite and pipeline numbers.
  - Architecture diagram showing suites → fixtures/data/auth setup → the
    self-hosted stack.
  - "Before and after" table (WP0 baseline vs current `main`) with the latest
    green run and the WP7 gate run.
  - Corrected coverage table (dashboard included) and project tree (scripts,
    auth setup, dashboard, docs index, metrics/progress, evidence).
  - Known limitations refreshed: retry-versus-stability distinction, warning-only
    flaky handling, trace-link depth, opt-in sharding, WP8 scope.
- `docs/README.md` — new index: start-here table, decision notes WP0–WP9, PR
  descriptions, and evidence with the run that produced each file.
- `docs/audit.md` — added a post-WP9 status note: the stale CI-link row and the
  incomplete project-tree row are addressed; the audit itself remains a
  historical snapshot of `c5ec4f2`.
- `docs/progress.md` — WP9 tracker row and current state.
- Repository About (via the GitHub API): description and topics.

## Verification

Claims in the README were checked against the repository rather than recalled:

| Claim | Check |
| --- | --- |
| 15 requests / 53 assertions | `postman/conduit.postman_collection.json` item and `pm.test` counts; CI summary artifact |
| 7 host runs (3 smoke, 3 regression, 1 setup) | Test titles and tags in `tests/`; `npm run check:tags` reports 3 + 3 |
| 2 visual tests, Linux container | `tests/visual/*.spec.ts`; `docker-compose.yml` visual profile |
| 8 CI stages, 2 m 56 s latest green `main` run | Run [`43562094955`](https://github.com/ifhamm/QA-Assessment/actions/runs/43562094955) job list and timings |
| Reports: merged HTML + JUnit + JSON, summary, gate | `playwright.merge.config.ts`, `scripts/ci-summary.mjs`, `tests.yml` |
| Commands in the quick start | Names checked against `package.json`; `typecheck`, `lint`, and `check:tags` run locally |
| Relative links and anchors | Local link check over every `*.md` in the repository |
| No unrelated behavior change | `git diff --stat` limited to `README.md`, `docs/`; workflow, tests, and config untouched |

CI runs the full eight-job pipeline on the PR; the PR run link is recorded in
`docs/progress.md` and the PR body.

## Trade-offs and risks

- **Breadth over depth at the top.** The README now answers "what is this and
  how do I run it" immediately, at the cost of a longer file. Detail still lives
  in the linked notes.
- **Badge drift.** The badge points at `tests.yml`; renaming the workflow breaks
  it. The workflow name is part of the repository's stable surface, so this is
  acceptable and easy to fix.
- **Duplicated numbers.** The at-a-glance and before/after tables repeat values
  from `docs/metrics.md`. They are deliberately derived from it and cite it; a
  future WP must update both.
- **About section is not versioned.** The description and topics live in
  repository settings, not in Git. The values are recorded here so a reviewer
  can see what was set.

## Follow-ups (not in this diff)

- The optional WP8 coverage expansion (negative tests, Firefox/WebKit smoke)
  remains unimplemented and needs its own approved plan.
- A logged-in screenshot of the `Quality Gate` job summary is still an owner
  action; the three summary artifacts are committed under `docs/evidence/`.
- Branch protection (`Static Checks` and `Quality Gate`, up-to-date branches,
  no direct pushes) is an owner action recorded in `docs/quality-gates.md`.
