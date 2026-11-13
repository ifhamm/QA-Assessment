# WP6: Staged CI Pipeline & Sharding

## Summary

CI is now a layered pipeline: static checks (typecheck, lint, tag check), API,
UI smoke, sharded UI regression, visual, and a report job that merges every
blob into one HTML artifact. Host tests carry exactly one of `@smoke` /
`@regression`; a static check fails the build on tag drift.

Sharding is implemented and covered by a real 3-shard CI run, but it is
opt-in and defaults to one shard. At 7 tests the measurements do not support
sharding: three shards saved 10 s of wall time and cost 3.4 extra
runner-minutes because each shard repeats the Playwright install and the
self-hosted stack build. The staged split itself also costs more than the old
flat workflow at this size (8.7 vs 4.9 runner-minutes). That conclusion is
recorded with the numbers rather than presented as a speedup.

Local stability evidence uses `retries: 0`: five consecutive 4-worker full
runs passed 7/7, plus three smoke runs, three sharded regression batches, and
the visual pair.

## Why

The pre-WP6 workflow ran `test:ui` and `test:cross` as two Playwright
invocations that wrote the same `playwright-report/` folder, so the second
overwrote the first. There was no tag vocabulary, no sharding, no merged
report, and no lint. WP6's acceptance asks for exactly those pieces, plus an
honest workers-vs-shards comparison.

## What changed

### Workflow

- `Static Checks`: `npm run typecheck`, `npm run lint`, `npm run check:tags`.
  Every other job depends on it.
- `API Tests`: unchanged Newman run against the self-hosted API.
- `UI Smoke`: `@smoke` tests; includes `setup` because the dashboard uses the
  storage state.
- `UI Regression`: `@regression` tests with `--no-deps`, one test per shard in
  the 3-shard evidence run. Those tests create their own users, so setup is
  not duplicated into the merged report.
- `Visual Tests`: unchanged pinned-container job; now also emits a blob so it
  can join the merged report.
- `Merged Report`: downloads `blob-report-*`, flattens every `*.zip`, merges
  with `playwright.merge.config.ts`, verifies `playwright-report/index.html`,
  and uploads `merged-report`.
- `Plan UI Shards`: builds the matrix from `github.event.inputs.shards || 1`.
  `workflow_dispatch` can request more shards; pushes and PRs stay at one.
- Playwright browser cache keyed by `package-lock.json`.
- PR runs cancel superseded runs; `main` pushes are never cancelled.

### Tests and scripts

- Tags: dashboard, UI login/create, and cross-layer create are `@smoke`; the
  other three host tests are `@regression`; visual tests stay untagged.
- `scripts/check-test-tags.mjs` parses `playwright test --list` and fails on
  missing, duplicated, or misplaced tags.
- New scripts: `test:smoke`, `test:regression`, `check:tags`, `lint`,
  `report:merge`.

### Reporting

- CI reporter: `blob` + `line`; local reporter: `html`.
- `playwright.merge.config.ts` pins `testDir: "./tests"` for merges only. The
  visual container records `/work/tests`, which Playwright refuses to merge
  with host paths otherwise.
- Visual failures still upload `visual-diffs`; failed stages upload traces.

### Lint

ESLint 10 + `typescript-eslint` 8 recommended rules. The one real finding, an
unused `expect` import in `pages/editor.page.ts`, is removed.

TypeScript 7 does not expose the compiler API that `typescript-eslint`
requires. Following the TypeScript team's guidance, the repository now
installs the TS 6 API under the `typescript` name for tooling and TypeScript 7
under `@typescript/native` for `tsc`. `npm run typecheck` still runs TS 7.

## Evidence

| Configuration | Run | Wall | Runner-minutes | Merged report |
| --- | --- | ---: | ---: | --- |
| Flat 3 jobs, 4 workers (pre-WP6 `main`) | [`41469719183`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469719183) | 2 m 09 s | 4.9 | No |
| Staged, 1 shard | [`43435185236`](https://github.com/ifhamm/QA-Assessment/actions/runs/43435185236) | 3 m 17 s | 8.7 | 203 KB |
| Staged, 3 shards | [`43435791291`](https://github.com/ifhamm/QA-Assessment/actions/runs/43435791291) | 3 m 07 s | 12.1 | Yes |

Local (warm stack, retries 0):

| Config | Tests | Wall | Playwright |
| --- | ---: | ---: | ---: |
| 1 worker, one job | 7 | 9.1–9.4 s | 7.9–8.1 s |
| 4 workers, one job | 7 | 7.0–7.9 s | 5.8–6.3 s |
| 3 regression shards, sequential | 3 | 24.5–25.4 s total | 20.9–22.1 s total |

Five consecutive 4-worker runs: 7/7 each, retries 0. Smoke: 4/4 on three
consecutive runs. Visual: 2/2 in 3.3 s.

The first merged-report attempt
([`43434297464`](https://github.com/ifhamm/QA-Assessment/actions/runs/43434297464))
failed because blob files are not named `report.zip`; the flattened merge was
skipped and the job went red. It was fixed by copying every `*.zip`, adding
the merge config for the container path, and failing the job when the HTML
report is missing. An earlier run (`43433653244`) silently uploaded no merged
report; that gap is now covered by the verification step.

## Out of scope

- Quality gates, JUnit/JSON output, and job summaries remain WP7.
- No assertion, timeout, retry, worker, or visual-threshold changes.
- No test behavior changes beyond tags.

## How to verify

```powershell
npm run stack:up
npm run typecheck
npm run lint
npm run check:tags
npm run test:local
npm run test:smoke
npm run test:regression
npm run test:visual
npm run stack:down
```

For the CI shard matrix, run the workflow manually with `shards: 3`.
