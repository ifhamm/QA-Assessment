# Quality Gates

Written policy for what CI blocks, what it only warns about, and how a reviewer
gets from a red run to the failing artifact. WP7 implements this policy in
`.github/workflows/tests.yml` and `scripts/ci-summary.mjs`.

## What blocks

| Signal | Workflow behaviour | Merge effect |
| --- | --- | --- |
| `Static Checks` fails (typecheck, lint, tag check) | downstream jobs are skipped, run is red | blocked |
| `API Tests` fails (Newman) | run is red, `api-results` still uploaded | blocked |
| `UI Smoke` fails | run is red, traces and results uploaded | blocked |
| `UI Regression` fails in any shard | that shard is red, other shards still run (`fail-fast: false`) | blocked |
| `Visual Tests` diff | run is red, `visual-diffs` uploaded | blocked until a human reviews the diff |
| `Browser Smoke` fails on either engine | that matrix leg is red, the other still runs (`fail-fast: false`) | blocked |
| `Merged Report` fails or produces no `index.html` | run is red | blocked |
| Any required stage report is missing | `Quality Gate` is red | blocked |

`Quality Gate` is the single check to require in branch protection. It reads
`needs.*.result` for every stage and fails when any stage is not `success`, so a
green report job can no longer sit on top of a red stage. Flaky tests do not
fail it; everything else does.

## What only warns

**Flaky** means a test that failed and then passed on retry. CI keeps
`retries: 1`; local runs stay at `retries: 0`, so the stability evidence cannot
hide flakiness.

- The merged summary lists every flaky test with its attempt count and first
  error.
- The run emits a `Flaky tests` warning annotation.
- The test does **not** block the merge, but it must be investigated: fix it,
  or file a follow-up with the run link. Do not raise retries, add sleeps, skip
  the test, or inflate timeouts to make the warning disappear.

**Visual diff** is a failure, not a warning, but it also needs a human decision.
The reviewer opens the `visual-diffs` artifact, compares expected/actual/diff,
and decides:

1. the UI change is intended and reviewed → update baselines in the same PR
   with a written reason, keeping Playwright's default thresholds and the image
   tag in sync with `@playwright/test`;
2. the change is unintended → fix the UI or the test; never widen the threshold
   to get green.

## Branch protection (owner action)

The workflow can fail, but only branch protection can stop a merge. The owner
should configure, in repository settings:

- required status checks: `Static Checks` and `Quality Gate`;
- "Require branches to be up to date before merging";
- no bypass for direct pushes to `main`.

PR #9 is the cautionary example: it was merged 102 seconds after opening, before
its check run finished. The check passed afterwards and `main` stayed green, but
the gate was not enforced. Until the settings above exist, the gate is advisory.

## Where to look

| Artifact | Contents |
| --- | --- |
| `summary` | Markdown copy of the job summary (counts, failures, flaky list) |
| `merged-report` | One HTML report for smoke, browser smoke, regression shards, and visual; traces and screenshots embedded |
| `merged-results` | Merged JSON + JUnit |
| `results-smoke`, `results-browser-<engine>`, `results-regression-<n>`, `results-visual` | Per-stage JSON + JUnit |
| `api-results` | Newman JSON (requests, assertions, failures) |
| `smoke-traces`, `browser-traces-<engine>`, `regression-traces-<n>`, `visual-diffs` | Failure-only trace/diff bundles |

Triage path: run summary → failing test row (stage, file:line, first error) →
`merged-report` artifact → the test's trace. That is the acceptance bar: a
failure is identifiable without opening each stage log.

## Implementation map

- `scripts/ci-summary.mjs` builds the summary and exits non-zero on gate
  failures. It treats a missing merged report or missing Newman report as a gate
  failure, so "no data" can never read as "green".
- `playwright.merge.config.ts` emits HTML, JUnit, and JSON from the merged blobs.
- `playwright.config.ts` emits JUnit and JSON next to the blob in CI stages. It
  also defines the `firefox-smoke` and `webkit-smoke` projects; the workflow
  adds their combined result as the `browser` stage in `GATE_RESULTS`.
- Per-stage artifacts are uploaded with `if: always()` so a red stage keeps its
  evidence.

## Exceptions

- **Emergency revert of a red `main`:** allowed, and must be a revert, not a
  feature. Record the run link in `docs/progress.md`.
- **Infrastructure failure** (runner or Docker registry): rerun the failed job
  once and record both run IDs. Never rerun until green without recording it.
- **No gate bypass for flakiness.** If a flaky test blocks unrelated work, fix
  or file it; do not delete or skip it without a written reason in the PR.
