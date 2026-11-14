# Documentation index

Everything that explains how this repository was built and how it is verified. The README is the entry point for running the suite; this page is the entry point for reviewing the work.

## Start here

| Document | What it answers |
| --- | --- |
| [`PRD.md`](PRD.md) | The original assessment brief, rules, work-package order, and definition of done. |
| [`progress.md`](progress.md) | Current state, the work-package tracker, blockers, and the per-WP evidence index. |
| [`metrics.md`](metrics.md) | Baseline and per-WP measurements: tests per layer, durations, UI logins, flakiness, CI cost, reporting quality. |
| [`quality-gates.md`](quality-gates.md) | The written block/warn policy, branch-protection settings, artifact map, and triage path. |
| [`audit.md`](audit.md) | The WP0 audit of the repository as found (`c5ec4f2`), including README claims vs reality. Kept as a historical snapshot. |

## Decision notes

One note per work package: the problem, the options considered, the decision, the trade-offs, and the evidence.

| WP | Note | Topic |
| --- | --- | --- |
| WP0 | [`decisions/WP0-baseline-audit.md`](decisions/WP0-baseline-audit.md) | Audit scope, CI auth unblock, owner decisions. |
| WP1 | [`decisions/WP1-fixtures-abstraction-boundaries.md`](decisions/WP1-fixtures-abstraction-boundaries.md) | Fixture boundaries, page objects, public-API token rotation. |
| WP2 | [`decisions/WP2-reuse-auth-state.md`](decisions/WP2-reuse-auth-state.md) | API-built `storageState`, per-test token injection, dashboard in CI. |
| WP3 | [`decisions/WP3-test-data-architecture.md`](decisions/WP3-test-data-architecture.md) | Worker-aware data factories, best-effort cleanup, the public-API identity defect. |
| WP4 | [`decisions/WP4-parallelism-reliability.md`](decisions/WP4-parallelism-reliability.md) | Four workers with `fullyParallel`, the self-hosted stack, the locator fix. |
| WP5 | [`decisions/WP5-visual-linux-ci.md`](decisions/WP5-visual-linux-ci.md) | The pinned Playwright container, Linux baselines, the failure artifact. |
| WP6 | [`decisions/WP6-staged-ci-sharding.md`](decisions/WP6-staged-ci-sharding.md) | Staged jobs, `@smoke`/`@regression` tags, sharding, the merged report. |
| WP7 | [`decisions/WP7-reporting-quality-gates.md`](decisions/WP7-reporting-quality-gates.md) | JUnit/JSON reporters, the job summary, the `Quality Gate` job, the policy. |
| WP8 | [`decisions/WP8-coverage-expansion.md`](decisions/WP8-coverage-expansion.md) | Negative UI/API cases, browser-vs-API level decisions, Firefox/WebKit smoke, gate integration. |
| WP9 | [`decisions/WP9-documentation-portfolio-polish.md`](decisions/WP9-documentation-portfolio-polish.md) | This documentation and portfolio pass, and what was verified. |

## PR descriptions

The PR body for each work package is committed here so the reasoning survives independently of GitHub.

- [WP0](pr/WP0-baseline-audit.md), [WP1](pr/WP1-fixtures-abstraction-boundaries.md), [WP2](pr/WP2-reuse-auth-state.md), [WP3](pr/WP3-test-data-architecture.md), [WP4](pr/WP4-parallelism-reliability.md), [WP5](pr/WP5-visual-linux-ci.md), [WP6](pr/WP6-staged-ci-sharding.md), [WP7](pr/WP7-reporting-quality-gates.md), [WP8](pr/WP8-coverage-expansion.md), [WP9](pr/WP9-documentation-portfolio-polish.md).

## Evidence

| File | Source |
| --- | --- |
| [`evidence/wp7-green-summary.md`](evidence/wp7-green-summary.md) | `summary` artifact of green run [`43552638345`](https://github.com/ifhamm/QA-Assessment/actions/runs/43552638345). |
| [`evidence/wp7-intentional-failure-summary.md`](evidence/wp7-intentional-failure-summary.md) | `summary` artifact of the deliberate smoke failure, run [`43553098095`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553098095); shows the failing test, stage, attempts, and trace availability. |
| [`evidence/wp7-flaky-warning-summary.md`](evidence/wp7-flaky-warning-summary.md) | `summary` artifact of the flaky-warning run [`43553398227`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553398227); the run stays green with a `##[warning]`. |
| [`evidence/wp5-intentional-failure-diff.png`](evidence/wp5-intentional-failure-diff.png), [`wp5-intentional-failure-actual.png`](evidence/wp5-intentional-failure-actual.png) | Visual diff and actual screenshot from run [`41466501007`](https://github.com/ifhamm/QA-Assessment/actions/runs/41466501007). |

Live run history: <https://github.com/ifhamm/QA-Assessment/actions/workflows/tests.yml>.
