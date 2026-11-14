# WP7: Reporting & Quality Gates

## Summary

A red run now explains itself. CI emits JUnit and JSON next to the merged HTML
report, a `Quality Gate` job writes a job summary with counts, failures, flaky
tests and artifact links, and the gate fails whenever any stage did not succeed
— including the case WP6 left open, where `Merged Report` was green on top of a
red stage. Flaky tests warn; visual diffs still require human review. The rules
are written down in `docs/quality-gates.md`.

Implementation is complete, merged, and CI-evidenced. The PR run and the
post-merge `main` run are green; the deliberate smoke failure and the
flaky-warning run are linked below.

## Why

"Something failed" was previously answered by opening each job log. The merged
report had no JUnit, no JSON, no summary, and no link from the pipeline to a
trace. The final job could be green while smoke or regression was red, API
results were absent from the merged output, and the merge rule existed only in
people's heads.

WP7's acceptance asks for a useful job summary, a documented and implemented
gate policy, and an intentional failure traceable from the summary in a few
clicks.

## What changed

### Reporters

- `playwright.config.ts`: CI stages emit `blob`, `line`, `junit`
  (`test-results/junit.xml`), `json` (`test-results/results.json`). Local runs
  stay HTML-only.
- `playwright.merge.config.ts`: merged output is `html` (`playwright-report/`),
  `list`, `junit` (`merged-junit.xml`), `json` (`merged.json`). `list` and the
  merged JSON were verified against Playwright 1.63.0 before wiring.

### Summary and gate

- `scripts/ci-summary.mjs` (new): parses the merged JSON, attributes failures to
  stages using the per-stage JSON, adds Newman results, writes
  `$GITHUB_STEP_SUMMARY` + `summary.md`, emits `::warning` for flaky and
  `::error` for gate failures, and exits non-zero when the gate fails.
- `Quality Gate` job (new): needs all stages and `Merged Report`, `if: always()`,
  no `npm ci`. Fails on any `needs.*.result != success`, on failed tests, failed
  Newman requests, or missing reports. That is the single required check.
- `npm run ci:summary` and `npm run test:api:local:ci` (Newman JSON export) make
  the same path reproducible locally.

### Artifacts

`api-results`, `results-smoke`, `results-regression-<n>`, `results-visual`,
`merged-results`, `summary`, plus the existing `blob-report-*`, `merged-report`,
`smoke-traces`, `regression-traces-<n>`, and `visual-diffs`. Stage results are
uploaded with `if: always()` so a red stage keeps its evidence.

### Policy

- `docs/quality-gates.md` (new): block/warn table, flaky rules, visual review
  rule, artifact map, triage path, exceptions, and the branch-protection
  settings the owner must apply.
- Branch protection is explicitly out of the workflow's control. PR #9 is
  recorded as the example of merging before the check finished.

## Evidence

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run check:tags` | 3 `@smoke`, 3 `@regression`, 2 visual |
| `merge-reports` with HTML/JUnit/JSON | all three produced |
| Summary, failing fixture | exit 1; failure + flaky + Newman rows correct |
| Summary, clean fixture | exit 0; verdict pass |
| Summary, missing inputs | exit 1; explicit reasons |
| Workflow YAML | parses; 8 jobs; artifact names verified |
| Green branch run | [`43552638345`](https://github.com/ifhamm/QA-Assessment/actions/runs/43552638345) — success, 2 m 44 s wall, gate 8 s |
| Job summary artifact | `summary` downloaded: 9 passed / 0 failed / 0 flaky; 15 requests, 53 assertions; committed as [`wp7-green-summary.md`](evidence/wp7-green-summary.md) |
| Intentional failure run | [`43553098095`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553098095) — smoke + gate red, merged report green, trace yes |
| Flaky warning run | [`43553398227`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553398227) — green, `##[warning]`, `regression-1` |
| Post-revert green run | [`43553744785`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553744785) — success |
| PR run | [`43554365923`](https://github.com/ifhamm/QA-Assessment/actions/runs/43554365923) — success on the merged tree, all 8 jobs |

Cost, recorded from the runs: the gate job takes 8–11 s. The branch green run
summed 439 s of job time and the post-merge `main` run 495 s, against 480 s for
WP6's post-merge run. That is variance in the stack builds, not a saving.
Sharding defaults and retry/assertion/timeout settings are unchanged.

## How to verify

```powershell
npm run typecheck
npm run lint
npm run check:tags
npm run stack:up
npm run test:local
npm run stack:down
```

Then push the branch and open the run summary → `merged-report` → failing test
trace. For the deliberate failure path, follow the run link recorded in
`docs/progress.md`.

## Out of scope

- WP8 coverage expansion and WP9 documentation polish.
- Hosting the HTML report (Pages or an external service).
- Any change to retries, assertions, timeouts, workers, sharding defaults, or
  visual thresholds.
- No test was added, skipped, or removed.

## Follow-ups

- Owner: apply branch protection (`Static Checks`, `Quality Gate`, up to date,
  no direct pushes) and record it in `docs/progress.md`.
- WP6 PR #9 and WP3 PR #4 still carry default titles and empty descriptions.

## Open questions

- **Screenshot (owner).** GitHub does not render step summaries to anonymous
  sessions, so the three `summary` artifacts are committed as Markdown under
  `docs/evidence/`. A screenshot of the summary from a logged-in session is the
  remaining PRD evidence item; everything else is linked to a run.
