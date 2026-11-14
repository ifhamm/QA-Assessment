# Progress

Last updated: 2026-11-14

## Current state

- **Current work package:** WP8 (Coverage Expansion) is in review on `wp8/coverage-expansion` as PR [#14](https://github.com/ifhamm/QA-Assessment/pull/14). The owner approved the plan on 2026-11-14. Scope: five browser negatives (registration gating, empty-article validation, logout, invalid stored token, delete article), two API negatives (duplicate registration, malformed token), and the three `@smoke` tests on Firefox + WebKit in a separate matrix job that feeds the merged report and `Quality Gate`. PR run [`43616194626`](https://github.com/ifhamm/QA-Assessment/actions/runs/43616194626) is green (2 m 58 s wall, 712 s summed, `Quality Gate` 7 s, 22 merged Playwright results, no failures or flakes). Awaiting owner merge. WP9 merged to `main` as `0736f7c` (PR [#12](https://github.com/ifhamm/QA-Assessment/pull/12)) with green post-merge run [`43564371444`](https://github.com/ifhamm/QA-Assessment/actions/runs/43564371444).
- **Status:** WP6 merged to `main` as `851afbd` (PR [#9](https://github.com/ifhamm/QA-Assessment/pull/9)) on 2026-11-14. Post-merge `main` run [`43549955277`](https://github.com/ifhamm/QA-Assessment/actions/runs/43549955277) is green (3 m 10 s; Static 48 s, API 1 m 27 s, Smoke 1 m 39 s, Regression 1 m 51 s, Visual 1 m 50 s, Merged Report 21 s; `merged-report` 202.8 KB), and the PR run [`43549808250`](https://github.com/ifhamm/QA-Assessment/actions/runs/43549808250) was green in 3 m 13 s. WP7 adds JUnit/JSON reporters, a `Quality Gate` job, a job summary, and the written policy. CI evidence: green run [`43552638345`](https://github.com/ifhamm/QA-Assessment/actions/runs/43552638345), intentional-failure run [`43553098095`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553098095), flaky-warning run [`43553398227`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553398227), and post-revert green run [`43553744785`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553744785). PR run [`43554365923`](https://github.com/ifhamm/QA-Assessment/actions/runs/43554365923) was green on the merged tree, and the post-merge `main` run [`43559903310`](https://github.com/ifhamm/QA-Assessment/actions/runs/43559903310) is green (3 m 05 s; 8 jobs, `Quality Gate` 11 s). WP9 merged as `0736f7c` (PR [#12](https://github.com/ifhamm/QA-Assessment/pull/12)), and the post-merge `main` run [`43564371444`](https://github.com/ifhamm/QA-Assessment/actions/runs/43564371444) is green (2 m 49 s; 8 jobs, `Quality Gate` 7 s). WP5 merged to `main` as `068f56a` (PR [#7](https://github.com/ifhamm/QA-Assessment/pull/7)) on 2026-11-02, and its docs follow-up merged as `183167e` (PR [#8](https://github.com/ifhamm/QA-Assessment/pull/8)) on 2026-11-13. Visual tests render only in `mcr.microsoft.com/playwright:v1.63.0-noble`; Windows baselines were removed. Post-merge `main` CI [run `41469719183`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469719183) is green (2 m 09 s; API 1 m 14 s, Playwright 1 m 55 s, Visual 1 m 49 s). The PR run [`41469698058`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469698058) was green in 1 m 51 s, and the intentional-failure experiment [`41466501007`](https://github.com/ifhamm/QA-Assessment/actions/runs/41466501007) failed only the Visual job.
- **CI policy:** local stability evidence uses `retries: 0`. CI uses one retry with `on-first-retry` tracing as an infrastructure safety net; failures are recorded honestly and failed jobs are rerun manually, never hidden with sleeps, skips, timeout inflation, or assertion changes.
- **Repository:** `https://github.com/ifhamm/QA-Assessment`
- **Baseline:** WP9 merged as `0736f7c` (PR [#12](https://github.com/ifhamm/QA-Assessment/pull/12)); WP7 merged as `5733ee4` (PR [#11](https://github.com/ifhamm/QA-Assessment/pull/11)); WP6 merged as `851afbd` (PR [#9](https://github.com/ifhamm/QA-Assessment/pull/9)); WP5 docs merged to `main` as `183167e` (PR [#8](https://github.com/ifhamm/QA-Assessment/pull/8)); WP5 merged as `068f56a` (PR [#7](https://github.com/ifhamm/QA-Assessment/pull/7)); WP4 merged as `494d243` (PR [#5](https://github.com/ifhamm/QA-Assessment/pull/5)); WP3 merged as `3fffa6f` (PR [#4](https://github.com/ifhamm/QA-Assessment/pull/4)); WP2 merged as `90e66ec` (PR [#3](https://github.com/ifhamm/QA-Assessment/pull/3)); WP1 merged as `e74a82d` (PR [#2](https://github.com/ifhamm/QA-Assessment/pull/2)); WP0 merged as `5364f30` (PR [#1](https://github.com/ifhamm/QA-Assessment/pull/1)).
- **Next work package:** none planned. WP8 was the final optional stretch package; any further coverage needs a new, separately approved plan.

## Work package tracker

| WP | Status | Branch / PR | Notes |
| --- | --- | --- | --- |
| WP0 | Complete, merged | `wp0/baseline-audit` / [#1](https://github.com/ifhamm/QA-Assessment/pull/1) | Merged as `5364f30` on 2026-10-30. Audit docs + minimal CI auth unblock. No test behavior changed. |
| WP1 | Complete, merged | `wp1/fixtures-abstraction-boundaries` / [#2](https://github.com/ifhamm/QA-Assessment/pull/2) | Merged as `e74a82d` on 2026-10-30. Fixtures completed; 3 tests migrated; expected `404` cleanup removed. No assertion changes. |
| WP2 | Complete, merged | `wp2/reuse-auth-state` / [#3](https://github.com/ifhamm/QA-Assessment/pull/3) | Merged as `90e66ec` on 2026-10-31. API-built storage state, per-test token injection, dashboard in CI, `test:ui` naming. |
| WP3 | Complete, merged | `wp3/test-data-architecture` / [#4](https://github.com/ifhamm/QA-Assessment/pull/4) | Merged as `3fffa6f` on 2026-11-01. Worker-aware data factories, fixture-owned best-effort cleanup, `--grep` and `--fully-parallel` evidence, found the public API's global token defect. CI: main push green; PR run red (environment). |
| WP4 | Complete, merged | `wp4/parallelism-reliability` / [#5](https://github.com/ifhamm/QA-Assessment/pull/5) | Merged as `494d243` on 2026-11-02. Self-hosted pinned RealWorld stack, 4 workers with `fullyParallel`, CI-only retry/trace, locator strict-mode fix. CI green on branch push/PR/main; API 1 m 57 s, Playwright 1 m 58 s on `main`. Docs follow-up: [#6](https://github.com/ifhamm/QA-Assessment/pull/6). |
| WP5 | Complete, merged | `wp5/visual-linux-ci` / [#7](https://github.com/ifhamm/QA-Assessment/pull/7) | Merged as `068f56a` on 2026-11-02. Pinned Playwright container for visual tests, Linux baselines replace Windows, separate CI job, failure artifact. PR run [`41469698058`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469698058) green; post-merge `main` run [`41469719183`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469719183) green; intentional failure [`41466501007`](https://github.com/ifhamm/QA-Assessment/actions/runs/41466501007). Docs: [`decisions/WP5-visual-linux-ci.md`](decisions/WP5-visual-linux-ci.md). |
| WP6 | Complete, merged | `wp6/staged-ci-sharding` / [#9](https://github.com/ifhamm/QA-Assessment/pull/9) | Merged as `851afbd` on 2026-11-14. Plan approved 2026-11-13 (add ESLint, sharding opt-in default 1). Staged jobs, `@smoke`/`@regression` + tag check, shard matrix, merged blob report, browser cache. 1-shard run [`43435185236`](https://github.com/ifhamm/QA-Assessment/actions/runs/43435185236) green (3 m 17 s, 8.7 runner-min); 3-shard run [`43435791291`](https://github.com/ifhamm/QA-Assessment/actions/runs/43435791291) green (3 m 07 s, 12.1 runner-min). PR run [`43549808250`](https://github.com/ifhamm/QA-Assessment/actions/runs/43549808250) green (3 m 13 s); post-merge `main` run [`43549955277`](https://github.com/ifhamm/QA-Assessment/actions/runs/43549955277) green (3 m 10 s). Sharding does not pay at 7 tests. Docs: [`decisions/WP6-staged-ci-sharding.md`](decisions/WP6-staged-ci-sharding.md). |
| WP7 | Complete, merged | `wp7/reporting-quality-gates` / [#11](https://github.com/ifhamm/QA-Assessment/pull/11) | Merged as `5733ee4` on 2026-11-14. Plan approved 2026-11-14. JUnit + JSON per stage, merged HTML/JUnit/JSON, `scripts/ci-summary.mjs`, `Quality Gate` job that fails on any non-success stage or missing report, flaky warns, visual diff needs review. Policy in [`quality-gates.md`](quality-gates.md). Green [`43552638345`](https://github.com/ifhamm/QA-Assessment/actions/runs/43552638345); intentional failure [`43553098095`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553098095); flaky warning [`43553398227`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553398227); post-revert green [`43553744785`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553744785); PR run [`43554365923`](https://github.com/ifhamm/QA-Assessment/actions/runs/43554365923); post-merge `main` [`43559903310`](https://github.com/ifhamm/QA-Assessment/actions/runs/43559903310). |
| WP8 | In review, PR [#14](https://github.com/ifhamm/QA-Assessment/pull/14) | `wp8/coverage-expansion` | Plan approved 2026-11-14. Five browser negatives (registration gating, empty article, logout, invalid stored token, delete article), two Newman negatives (duplicate registration, malformed token), Firefox/WebKit `@smoke` matrix job merged into the report and gate. Local: 150/150 negative repeats, 61/61 cross-browser repeats, 17 requests / 57 assertions. PR run `43616194626` green: 2 m 58 s wall, 712 s summed, 22 merged Playwright results, no flakes. |
| WP9 | Complete, merged | `wp9/docs-portfolio-polish` / [#12](https://github.com/ifhamm/QA-Assessment/pull/12) | Merged as `0736f7c` on 2026-11-14. Plan approved 2026-11-14. README results summary, CI badge, quick start, architecture and pipeline diagrams, before/after metrics, corrected project tree and limitations; `docs/README.md` index; audit status; repository About. Docs-only. PR run [`43563573950`](https://github.com/ifhamm/QA-Assessment/actions/runs/43563573950) green; post-merge `main` run [`43564371444`](https://github.com/ifhamm/QA-Assessment/actions/runs/43564371444) green (2 m 49 s, 8 jobs). |

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

### WP6

- [`docs/decisions/WP6-staged-ci-sharding.md`](decisions/WP6-staged-ci-sharding.md) — options, staged layout, tags, sharding decision, merge config, TypeScript/lint alias, trade-offs, and the workers-vs-shards data.
- [`docs/pr/WP6-staged-ci-sharding.md`](pr/WP6-staged-ci-sharding.md) — PR description.
- [`docs/metrics.md`](metrics.md) — WP6 before/after, local comparison, CI comparison, and the sharding conclusion.
- [`.github/workflows/tests.yml`](../.github/workflows/tests.yml) — staged jobs, tag gate, shard matrix, merged report, caches.
- [`scripts/check-test-tags.mjs`](../scripts/check-test-tags.mjs) — static tag check; [`eslint.config.mjs`](../eslint.config.mjs) — minimal lint.
- [`playwright.merge.config.ts`](../playwright.merge.config.ts) — merge-only `testDir` so the container visual blob joins host blobs.
- Green 1-shard run [`43435185236`](https://github.com/ifhamm/QA-Assessment/actions/runs/43435185236) — 3 m 17 s wall, 8.7 runner-minutes, `merged-report` 203 KB.
- Green 3-shard evidence run [`43435791291`](https://github.com/ifhamm/QA-Assessment/actions/runs/43435791291) — 3 m 07 s wall, 12.1 runner-minutes; merged report contains smoke, three regression shards, and visual.
- Failed intermediate run [`43434297464`](https://github.com/ifhamm/QA-Assessment/actions/runs/43434297464) — `Merged Report` job red because blob zips were not flattened. Fixed and guarded by a report-existence check.
- Local (retries 0): five consecutive 4-worker runs 7/7; three smoke runs 4/4; three sharded regression batches 3/3; visual 2/2 in 3.3 s. Worker comparison: 1 worker 9.1–9.4 s wall / 7.9–8.1 s Playwright; 4 workers 7.0–7.9 s / 5.8–6.3 s.
- PR [#9](https://github.com/ifhamm/QA-Assessment/pull/9) merged as `851afbd` on 2026-11-14. PR run [`43549808250`](https://github.com/ifhamm/QA-Assessment/actions/runs/43549808250) green in 3 m 13 s and post-merge `main` run [`43549955277`](https://github.com/ifhamm/QA-Assessment/actions/runs/43549955277) green in 3 m 10 s; all seven jobs green in both.
- Post-merge `main` artifacts: `blob-report-smoke`, `blob-report-regression-1`, `blob-report-visual`, and `merged-report` (202.8 KB).
- Process gap recorded: the PR was opened at 03:05:41Z and merged at 03:07:23Z, before its own check run finished, and it still carries the default title and an empty description with no plan comment. See the blockers list.

### WP7

- [`docs/decisions/WP7-reporting-quality-gates.md`](decisions/WP7-reporting-quality-gates.md) — reporter and gate options, decision, trade-offs, risks, and local evidence.
- [`docs/pr/WP7-reporting-quality-gates.md`](pr/WP7-reporting-quality-gates.md) — PR description.
- [`docs/quality-gates.md`](quality-gates.md) — written block/warn policy, flaky and visual review rules, branch-protection settings, artifact map, triage path.
- [`.github/workflows/tests.yml`](../.github/workflows/tests.yml) — JUnit/JSON stage reporters, per-stage result artifacts, merged JUnit/JSON, `Quality Gate` job.
- [`scripts/ci-summary.mjs`](../scripts/ci-summary.mjs) — summary and gate evaluation; [`playwright.merge.config.ts`](../playwright.merge.config.ts) — HTML/JUnit/JSON merged reporters.
- Local (retries n/a): `npm run typecheck`, `npm run lint`, and `npm run check:tags` green. `merge-reports` produced `index.html`, `merged.json`, and `merged-junit.xml`. Summary fixtures: 1 failed / 1 flaky / 1 skipped / 1 passed with a failed Newman request → exit 1 with the failure, flaky, API, and gate rows; clean fixture → exit 0; missing inputs → exit 1 with explicit reasons.
- Green run [`43552638345`](https://github.com/ifhamm/QA-Assessment/actions/runs/43552638345) — 2 m 44 s wall, 439 s summed job time, `Quality Gate` 8 s; summary 9 passed / 0 failed / 0 flaky; 15 requests, 53 assertions; all expected artifacts present (`summary`, `merged-results`, `merged-report`, per-stage results).
- Intentional failure [`43553098095`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553098095) — `UI Smoke` and `Quality Gate` red, `Merged Report` still green; summary names the probe at `tests/ui/wp7-intentional-failure.spec.ts:6`, stage `smoke`, 2 attempts, trace yes. Probe reverted in `3dd96e3`.
- Flaky warning [`43553398227`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553398227) — run green with `##[warning]`; flaky row attributed to `regression-1`, 2 attempts; verdict pass with warnings. Probe reverted in `ff90cdf`.
- Post-revert green [`43553744785`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553744785) — 2 m 43 s wall, all 8 jobs green.
- Committed summaries: [`wp7-green-summary.md`](evidence/wp7-green-summary.md), [`wp7-intentional-failure-summary.md`](evidence/wp7-intentional-failure-summary.md), [`wp7-flaky-warning-summary.md`](evidence/wp7-flaky-warning-summary.md), all downloaded from the `summary` artifacts. GitHub does not render step summaries to anonymous sessions, so a logged-in screenshot remains an owner action.

### WP9

- [`docs/decisions/WP9-documentation-portfolio-polish.md`](decisions/WP9-documentation-portfolio-polish.md) — options, decisions, verification checklist, trade-offs, and follow-ups.
- [`docs/pr/WP9-documentation-portfolio-polish.md`](pr/WP9-documentation-portfolio-polish.md) — PR description.
- [`README.md`](../README.md) — CI badge, results summary, quick start, architecture diagram, before/after metrics, corrected project tree, refreshed limitations.
- [`docs/README.md`](README.md) — index of the PRD, progress, metrics, policy, audit, decision notes, PR bodies, and evidence.
- Local: `npm run typecheck`, `npm run lint`, and `npm run check:tags` green; relative-link and anchor check clean.
- PR run [`43563573950`](https://github.com/ifhamm/QA-Assessment/actions/runs/43563573950) — green on `2023229`, 2 m 49 s wall, 459 s summed job time, `Quality Gate` 12 s, all 8 jobs.
- Post-merge `main` run [`43564371444`](https://github.com/ifhamm/QA-Assessment/actions/runs/43564371444) — green on `0736f7c`, 2 m 49 s wall, 463 s summed job time, `Quality Gate` 7 s, all 8 jobs.

### WP8

- [`docs/decisions/WP8-coverage-expansion.md`](decisions/WP8-coverage-expansion.md) — test-by-test UI/API decision, cross-browser design, counts, trade-offs, and local evidence.
- [`docs/pr/WP8-coverage-expansion.md`](pr/WP8-coverage-expansion.md) — PR description.
- [`tests/ui/negative.spec.ts`](../tests/ui/negative.spec.ts) — five new `@regression` tests; [`pages/register.page.ts`](../pages/register.page.ts) and [`pages/settings.page.ts`](../pages/settings.page.ts) — new page objects.
- [`playwright.config.ts`](../playwright.config.ts) — `firefox-smoke` and `webkit-smoke` projects; [`.github/workflows/tests.yml`](../.github/workflows/tests.yml) — `Browser Smoke` matrix job and the `browser` gate stage.
- [`postman/conduit.postman_collection.json`](../postman/conduit.postman_collection.json) — duplicate registration (`409`) and malformed token (`401`).
- PR run [`43616194626`](https://github.com/ifhamm/QA-Assessment/actions/runs/43616194626) — green, 2 m 58 s wall, 712 s summed, `Quality Gate` 7 s, all 10 jobs, 22 merged Playwright results (0 failed, 0 flaky), `browser` stage `success`.
- Local: typecheck, lint, and tag check green (9 `@smoke` listings across 3 projects, 8 `@regression`, 2 visual). New tests `50/50` at `--repeat-each=10` and `100/100` at `--repeat-each=20`, retries 0; full suite `12/12`; cross-browser `7/7` including setup and `61/61` at `--repeat-each=10`; Newman `17 requests / 57 assertions`, 0 failed.

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

## WP6 summary

- CI is now layered: `Static Checks` (typecheck, lint, tag check) gates `API Tests`, `UI Smoke`, `UI Regression`, and `Visual Tests`, and every stage feeds one `Merged Report`.
- Each host test carries exactly one of `@smoke` / `@regression`; `npm run check:tags` parses `playwright test --list` and fails on missing, duplicated, or misplaced tags.
- Sharding is opt-in. `Plan UI Shards` reads `github.event.inputs.shards || 1`, so pushes and PRs run one shard and `workflow_dispatch` can request more. The 3-shard run is evidence, not the default.
- Reporting uses `blob` + `line` in CI and one merged HTML report (`playwright.merge.config.ts` pins `testDir` so the container visual blob merges with host blobs). The report job fails when `index.html` is missing, so a silent empty merge cannot pass.
- Lint is ESLint 10 + `typescript-eslint` 8 recommended rules, which found one real unused import. `typescript` is aliased to the TS 6 API for tooling while `@typescript/native` supplies the TS 7 `tsc`; `npm run typecheck` is unchanged.
- Honest conclusion: at 7 tests sharding does not pay (3 shards save 10 s wall but cost 3.4 extra runner-minutes), and the staged split costs 8.7 vs 4.9 runner-minutes. The stages are kept for isolation and growth; the default stays at one shard.
- PR [#9](https://github.com/ifhamm/QA-Assessment/pull/9) merged as `851afbd` on 2026-11-14; the PR run [`43549808250`](https://github.com/ifhamm/QA-Assessment/actions/runs/43549808250) and the post-merge `main` run [`43549955277`](https://github.com/ifhamm/QA-Assessment/actions/runs/43549955277) were both green with a 202.8 KB merged report.

## WP7 summary

- Every stage uploads JUnit + JSON; `Merged Report` produces HTML, `merged-junit.xml`, and `merged.json`. `Quality Gate` is a separate Node-only job that runs with `if: always()` and reads every `needs.*.result`.
- `scripts/ci-summary.mjs` writes the job summary and evaluates gates. Any non-`success` stage, missing report, failed test, or failed Newman request blocks; flaky tests only warn.
- Verified live: an intentional smoke failure turned `UI Smoke` and `Quality Gate` red while `Merged Report` stayed green, and a retry-only flaky test produced a `::warning` plus a summary row without failing the run.
- Merged as `5733ee4` via PR [#11](https://github.com/ifhamm/QA-Assessment/pull/11) on 2026-11-14. The post-merge `main` run [`43559903310`](https://github.com/ifhamm/QA-Assessment/actions/runs/43559903310) is green: 3 m 05 s wall, 495 s summed job time, `Quality Gate` 11 s, all eight jobs green.
- Remaining: a logged-in screenshot of the summary and branch protection (blockers 7 and 9). Both are owner actions.

## WP9 summary

- README now opens with the CI badge, a results summary, a five-command quickstart, an architecture diagram, and a before/after metrics table; the coverage table, project tree, and known limitations match the current repository.
- `docs/README.md` indexes the PRD, progress, metrics, quality gates, audit, every decision note and PR body, and the evidence files. `docs/audit.md` records that the stale CI link and incomplete tree were fixed.
- Counts were verified mechanically, not recalled: 15 Newman requests / 53 assertions, 9 Playwright tests in 6 files, 3 `@smoke` + 3 `@regression` + 2 visual, 8 CI jobs; all 99 relative links and anchors resolve.
- Merged as `0736f7c` via PR [#12](https://github.com/ifhamm/QA-Assessment/pull/12) on 2026-11-14. PR run [`43563573950`](https://github.com/ifhamm/QA-Assessment/actions/runs/43563573950) and post-merge `main` run [`43564371444`](https://github.com/ifhamm/QA-Assessment/actions/runs/43564371444) are green; the post-merge run took 2 m 49 s with `Quality Gate` at 7 s.
- Repository About set through the API: description plus 14 topics. The only WP9 follow-ups are the two owner actions (branch protection and the summary screenshot).

## WP8 summary

- Added five browser negatives and two API negatives without duplicating the existing invalid-credentials and protected-route tests. Each case has a written UI-vs-API rationale in the decision note.
- `firefox-smoke` and `webkit-smoke` run the three `@smoke` tests on both engines in a `fail-fast: false` matrix job; their blobs join the merged report and one aggregated `browser` stage blocks the gate. Chromium stages are unchanged.
- Counts moved from 9 to 14 Playwright tests (3 smoke / 8 regression / 2 visual / 1 setup), 7 to 12 host tests, 6 to 7 spec files, and 15/53 to 17/57 Newman requests/assertions.
- Local stability: 150/150 retry-free repeats on the new tests, 61/61 including setup on the browser projects, full suite 12/12.
- PR run [`43616194626`](https://github.com/ifhamm/QA-Assessment/actions/runs/43616194626) is green: 2 m 58 s wall (169 s to 178 s), 712 s summed (463 s to 712 s), `Quality Gate` 7 s, 22 merged Playwright results with no failures or flakes. The `summary` artifact lists the `browser` stage as `success`.

## Blockers / decisions needed

1. **WP3 PR description (resolved).** [#4](https://github.com/ifhamm/QA-Assessment/pull/4) now carries the title `WP3: Test Data Architecture` and the description from `docs/pr/WP3-test-data-architecture.md`.
2. **WP5 docs follow-up resolved.** PR [#8](https://github.com/ifhamm/QA-Assessment/pull/8) merged as `183167e` on 2026-11-13; post-merge `main` run [`43428417145`](https://github.com/ifhamm/QA-Assessment/actions/runs/43428417145) was green (API 1 m 12 s, Playwright 1 m 52 s, Visual 1 m 51 s).
3. **WP6 PR record (resolved).** PR [#9](https://github.com/ifhamm/QA-Assessment/pull/9) now has the title `WP6: Staged CI Pipeline & Sharding`, the description from `docs/pr/WP6-staged-ci-sharding.md`, and the plan comment. It was still merged 102 s after opening, before its check run completed; branch protection is the remaining fix (blocker 7).
4. **WP6 sharding default.** One shard is the default. Enable more shards through `workflow_dispatch` when the regression stage grows; the measured 3-shard run is the evidence, not a new default.
5. **CI policy (resolved for WP1–WP6).** Accept environment-dependent failures and rerun failed jobs manually. Local stability is proven without retries; CI has a single retry with first-retry tracing. The cited WP6 evidence runs were green without consuming a retry; the intermediate merged-report failure was fixed in code, not retried.
6. **WP7 CI evidence (resolved).** The green run, `summary` artifact, intentional-failure run, flaky-warning run, and post-revert green run are recorded in `docs/metrics.md` and above. PR [#11](https://github.com/ifhamm/QA-Assessment/pull/11) merged as `5733ee4`, and the post-merge `main` run [`43559903310`](https://github.com/ifhamm/QA-Assessment/actions/runs/43559903310) is green.
7. **Branch protection (owner).** Require `Static Checks` and `Quality Gate`, require up-to-date branches, and block direct pushes to `main`; a workflow cannot enforce this. PR #9 merged 102 s after opening, before its check finished, and WP7 exists to make that failure visible. Record the setting in this file once applied.
8. **Rebase ordering (resolved).** WP7 merged before the WP6 docs follow-up, so the shared `progress.md`/`metrics.md` sections were reconciled in PR [#10](https://github.com/ifhamm/QA-Assessment/pull/10) instead of a branch rebase.
9. **Job summary screenshot (owner).** GitHub does not render step summaries to anonymous sessions, so the three `summary` artifacts are committed as Markdown under `docs/evidence/`. A screenshot from a logged-in session is still needed; save it under `docs/evidence/` in a follow-up PR, or attach it to a new issue.
