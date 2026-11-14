# WP7 — Reporting & Quality Gates

- **Date:** 2026-11-14
- **Branch:** `wp7/reporting-quality-gates`
- **Base:** `main` at `851afbd` (WP6 merge)
- **Owner decision:** plan approved as written on 2026-11-14 (JUnit + JSON + job
  summary, separate `Quality Gate` job, written policy, flaky warns, visual diff
  requires human review).

## Context

WP6 gave CI stages and one merged HTML report. It did not give anyone a fast
answer to "what failed, where, and is that flaky?". The report job also runs
with `if: always()`, so it can be green while smoke or regression is red — the
run is red overall, but the final job implies a healthy pipeline. API results
never reached the merged output at all, and there was no written rule for what
blocks a merge.

The suite is small (7 host tests, 2 visual, 15 Newman requests), so the solution
has to stay cheap. A reporting service or a second test execution is not
justified.

## Options considered

| Option | Assessment |
| --- | --- |
| Built-in reporters (`junit`, `json`, `html`) + a small summary script — **chosen** | No new dependency, no credential, works with blob merging, and the script is testable offline against fixtures. |
| Allure or another hosted reporting service | Better UI, but adds a service, credentials, and a publish step. Out of scope for a single-pipeline deliverable. |
| Parse the blob zip contents directly | The blob format is an internal Playwright contract. Merging first and reading the supported JSON is safer. |
| Fold the gate into `Merged Report` | One job fewer, but publishing the report and judging the pipeline are different responsibilities; a separate ~15 s job is clearer and cheap. |
| Fail the run on flaky tests | Contradicts the PRD: flaky must be visible and investigated, not silently converted into a hard block. |

## Decision

### Reporters

- CI stage runs (`PLAYWRIGHT_BLOB_OUTPUT_DIR` set): `blob`, `line`, `junit`
  (`test-results/junit.xml`), `json` (`test-results/results.json`).
- `playwright.merge.config.ts` emits `html`, `list`, `junit`
  (`test-results/merged-junit.xml`), and `json` (`test-results/merged.json`).
- Local runs keep the HTML reporter only.

`merge-reports` was verified to accept `json` and `junit` from the config on
Playwright 1.63.0 before the workflow was changed.

### Summary

`scripts/ci-summary.mjs` reads the merged JSON (plus per-stage JSON for stage
attribution and the Newman JSON), writes `$GITHUB_STEP_SUMMARY` and `summary.md`,
and prints annotations:

- totals: passed, failed, flaky, skipped;
- a stage-result table built from `needs.*.result`;
- failures: test, `file:line`, project, stage/shard, attempts, trace yes/no,
  first error;
- flaky table with the **first** failure (the last attempt passed, so reporting
  the last error would be empty);
- Newman requests/assertions and its failures;
- where to look: run link and artifact names.

The script exits non-zero on gate failures. Missing merged or Newman data is a
failure, never an empty green summary.

### Gate job

`Quality Gate` needs every stage plus `Merged Report`, runs with `if: always()`,
installs no dependencies, and took 8 s on the first green run. It fails when any
needed stage is not `success`, when results are missing, or when the summary
reports failed tests or failed requests. Flaky tests warn only.

This closes the WP6 hole: a green `Merged Report` sitting on a red smoke stage
now produces a red `Quality Gate`.

### Policy

[`docs/quality-gates.md`](../quality-gates.md) is the written policy: what
blocks, what warns, the flaky rules, the visual-diff review rule, the artifact
map, exceptions, and the branch-protection settings the owner must apply.
Branch protection cannot be configured by a workflow, so the document names the
required checks (`Static Checks`, `Quality Gate`) and records PR #9 as the
example of a merge that happened before the check finished.

### Flakiness

CI keeps one retry, local runs keep zero. A test that passes on retry appears in
the summary and in a `::warning` annotation, and stays out of the blocking gate.
That matches the PRD and keeps the retry honest: the run can be green, but the
flakiness is recorded in the artifact and the annotation, not hidden.

### Cost

One extra job (no `npm ci`, Node only, 8 s measured) and small JUnit/JSON
uploads per stage. The green WP7 run summed 439 s of job time against 480 s for
the WP6 post-merge `main` run; the difference is run-to-run variance in the
stack builds, not a saving. Billable minutes remain dominated by the per-stage
Docker builds, as in WP6.

## Trade-offs

- JUnit and JSON duplicate information already in the blob, in exchange for
  consumers that cannot read a blob and for the summary parser.
- The summary depends on Playwright's JSON schema. The parser is deliberately
  tolerant (nested suites, missing error objects, container paths) and was
  exercised against a real merged report before being wired in.
- Link depth stops at summary → artifact → report → trace. Hosting the report
  would need GitHub Pages or an external service; that is not worth the surface
  for this repository.
- The gate is advisory until branch protection is enabled. That is an owner
  setting, not something the workflow can enforce.

## Risks

- GitHub expression parsing with hyphenated job ids: uses
  `needs['api-tests'].result` bracket syntax rather than dot access.
- A failed stage that dies before producing results would leave the gate with
  missing data. That is treated as a gate failure with an explicit reason.
- `test-results/` is shared by traces and reporters inside one job; stage
  artifacts are uploaded by explicit path so traces do not bloat them.

## Evidence

Local verification before the first push:

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run check:tags` | 3 `@smoke`, 3 `@regression`, 2 visual |
| `merge-reports` with HTML + JUnit + JSON | produced `merged.json`, `merged-junit.xml`, `index.html` |
| Summary on a failing fixture (1 failed, 1 flaky, 1 skipped, 1 passed) | exit 1; failure and flaky tables correct; Newman failure shown |
| Summary on a clean fixture | exit 0, verdict pass |
| Summary with missing inputs | exit 1, explicit gate reasons |
| Workflow YAML | parses; 8 jobs; gate env and artifact names verified |

CI evidence:

- Green run [`43552638345`](https://github.com/ifhamm/QA-Assessment/actions/runs/43552638345)
  — 2 m 44 s wall, 439 s summed job time, `Quality Gate` 8 s; summary 9 passed /
  0 failed / 0 flaky; 15 requests, 53 assertions.
- Intentional failure [`43553098095`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553098095)
  — smoke and gate red, merged report still green; summary names the probe,
  stage `smoke`, 2 attempts, trace yes.
- Flaky warning [`43553398227`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553398227)
  — green with a `##[warning]` annotation and a flaky row attributed to
  `regression-1`.
- Post-revert green [`43553744785`](https://github.com/ifhamm/QA-Assessment/actions/runs/43553744785)
  — 2 m 43 s wall, all 8 jobs green. The probe files are not in the branch.
- Merged as `5733ee4` via PR [#11](https://github.com/ifhamm/QA-Assessment/pull/11)
  on 2026-11-14; the post-merge `main` run
  [`43559903310`](https://github.com/ifhamm/QA-Assessment/actions/runs/43559903310)
  is green in 3 m 05 s with `Quality Gate` at 11 s.

## How to verify

```powershell
npm run typecheck
npm run lint
npm run check:tags
npm run ci:summary -- --playwright <merged.json> --newman <newman.json> --out summary.md
```

In CI: open the run summary, then the `merged-report` artifact, then the failing
test's trace. For the failure path, see the intentional-failure run recorded in
`docs/progress.md`.
