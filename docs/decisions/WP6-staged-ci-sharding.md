# WP6 — Staged CI Pipeline & Sharding

- **Date:** 2026-11-13
- **Branch:** `wp6/staged-ci-sharding`
- **Base:** `main` at `183167e` (WP5 docs merged)
- **Owner decisions:** plan approved as written; add a minimal ESLint setup; sharding is opt-in with a default of one shard.

## Context

Before WP6 the workflow was three flat jobs (`API Tests`, `Playwright Tests`,
`Visual Tests`). The Playwright job ran `test:ui` and `test:cross` as two
separate invocations, and both wrote `playwright-report/`, so the second run
overwrote the first. There were no tags, no sharding, no merged report, no
lint, and no artifact that showed the whole suite in one place.

The suite is 9 tests: 7 host tests (setup, dashboard, 3 UI functional,
2 cross-layer) and 2 visual tests. The pre-WP6 `main` run took 2 m 09 s wall
with 4.9 runner-minutes.

WP6's acceptance requires tags, layered stages, sharding, a merged report,
dependency/browser caching, and an honest workers-vs-shards comparison.

## Options considered

| Option | Assessment |
| --- | --- |
| Keep the flat three-job workflow | Fastest and cheapest at this suite size, but fails the staging, tagging, sharding, and merged-report acceptance criteria. |
| Staged jobs + opt-in sharding — **chosen** | Satisfies the acceptance criteria, keeps the default path fast, and leaves sharding available without forcing its overhead on every PR. |
| Always three shards | Simplest demo of sharding, but measured at 12.1 runner-minutes for 7 tests (see below). Rejected as the default. |
| Third-party reporting service | Adds an external dependency and a credential; out of scope for a single-pipeline deliverable. |

## Decision

### Stages

```
Static Checks ─┬─ API Tests
               ├─ UI Smoke (@smoke, one job)
               ├─ UI Regression (@regression, shard matrix)
               └─ Visual Tests (pinned container)
                        ↓
                  Merged Report
```

- `Static Checks` runs typecheck, lint, and the tag check. All other jobs
  depend on it, so a lint failure does not spend runner time building stacks.
- `API Tests` is unchanged apart from the dependency.
- `UI Smoke` runs `@smoke`: dashboard, UI login/create, cross-layer create. It
  runs `setup` because the dashboard needs the storage state.
- `UI Regression` runs `@regression` with `--no-deps`. Those three tests create
  their own users, so the setup project is not needed and does not appear as a
  duplicate row in the merged report.
- `Visual Tests` keeps its own job and the pinned
  `mcr.microsoft.com/playwright:v1.63.0-noble` container.
- `Merged Report` downloads every blob, merges it into one HTML report, and
  fails if `playwright-report/index.html` was not produced. A silent empty
  merge is treated as a failure, not a warning.

### Tags

Each host test carries exactly one of `@smoke` or `@regression`. Setup and
visual tests stay untagged. `scripts/check-test-tags.mjs` parses
`playwright test --list` and fails the static stage when a tag is missing,
duplicated, or attached to the wrong project.

### Sharding

`UI Regression` uses a matrix built by `Plan UI Shards` from
`github.event.inputs.shards || 1`. The normal push/PR path runs one shard;
`workflow_dispatch` can request 2–3+ shards without changing the code. Shard
runs emit blob reports named per artifact, and the report job flattens and
merges them.

### Merged report

CI uses `[["blob", { outputDir }], ["line"]]`; local runs keep the HTML
reporter. Each stage uploads a `blob-report-*` artifact. The report job
downloads them, copies every `*.zip` into a flat directory, and runs
`merge-reports` with `playwright.merge.config.ts`.

The merge config exists because the visual tests record `testDir=/work/tests`
inside the container while host jobs record the runner checkout path.
Playwright refuses to merge reports from different test directories; pinning
`testDir: "./tests"` in a merge-only config resolves that without changing how
any test runs. The first merged report attempt (run `43434297464`) failed for
exactly this reason, and an earlier run (`43433653244`) uploaded no
`merged-report` because blob files are named `report-<project>-<shard>.zip`,
not `report.zip`. Both defects are fixed; the report job now verifies the file
exists.

### Caching

- npm: `actions/setup-node` with `cache: npm`.
- Playwright browsers: `actions/cache` on `~/.cache/ms-playwright`, keyed by
  the lockfile hash.
- Docker: no cross-job image cache. Each stage builds the stack itself, which
  is the dominant cost of the staged pipeline and is measured below rather
  than hidden.

### Lint

ESLint 10 with `typescript-eslint` 8 and the recommended rule set. This found
one real issue, an unused `expect` import in `pages/editor.page.ts`, which is
removed. TypeScript 7 does not expose the compiler API that `typescript-eslint`
needs, so the repository follows the TypeScript team's side-by-side guidance:

- `typescript` → `npm:@typescript/typescript6` (the TS 6 API used by the
  parser),
- `@typescript/native` → `npm:typescript@^7` (the `tsc` binary used by
  `npm run typecheck`).

`npm run typecheck` still runs TypeScript 7. This alias is tooling-only and is
recorded here because it is a non-obvious dependency change.

### Other workflow changes

- `concurrency` cancels a superseded PR run; pushes to `main` are never
  cancelled so the recorded run always finishes.
- Workflow-dispatch input `shards` defaults to 1.
- Failed shards upload traces; visual failures keep the `visual-diffs`
  artifact.

## Trade-offs

- The staged split duplicates dependency install, browser install, and stack
  builds. For 7 tests that costs more wall time and runner-minutes than the
  flat workflow (measured below). The split is kept because it provides
  independent failure domains, a clear smoke gate, and room to grow.
- Sharding three regression tests gives one test per shard and pays the full
  shard startup cost three times. It does not pay off at this size; the
  capability is opt-in and documented with numbers instead of being presented
  as a speedup.
- A lint toolchain that depends on a TypeScript 6 compatibility alias adds
  maintenance. It is pinned through `package-lock.json` and limited to
  `eslint`, with no type-aware rules.
- Tags can drift; the static check makes drift a red build.

## Evidence

### Local comparison (warm stack, retries disabled)

Five consecutive 4-worker full runs (`npm run test:local`, 7 tests):

| Run | Wall | Playwright | Result |
| ---: | ---: | ---: | --- |
| 1 | 7.9 s | 6.3 s | 7 passed |
| 2 | 7.1 s | 5.8 s | 7 passed |
| 3 | 7.0 s | 5.8 s | 7 passed |
| 4 | 7.1 s | 5.9 s | 7 passed |
| 5 | 7.2 s | 5.8 s | 7 passed |

Worker comparison (same 7 tests, warm stack):

| Workers | Runs | Wall | Playwright |
| ---: | --- | ---: | ---: |
| 1 | 3 | 9.1–9.4 s | 7.9–8.1 s |
| 4 | 5 | 7.0–7.9 s | 5.8–6.3 s |

Three regression shards, run sequentially on one machine (3 tests, so this is
not a full-suite wall comparison):

| Replication | Shard walls | Sum wall | Sum Playwright |
| ---: | --- | ---: | ---: |
| 1 | 12.8 / 6.5 / 5.2 s | 24.5 s | 20.9 s |
| 2 | 12.6 / 7.0 / 5.1 s | 24.7 s | 21.6 s |
| 3 | 12.8 / 7.1 / 5.5 s | 25.4 s | 22.1 s |

Smoke stage alone: 15.2–15.7 s wall, 14.0–14.6 s Playwright, 4 passed, three
consecutive runs. Visual stage: 2 passed in 3.3 s in the pinned container.

### CI comparison

| Configuration | Run | Wall | Runner-minutes | Merged report |
| --- | --- | ---: | ---: | --- |
| Flat 3 jobs, 4 workers (pre-WP6 `main`) | [`41469719183`](https://github.com/ifhamm/QA-Assessment/actions/runs/41469719183) | 2 m 09 s | 4.9 | No |
| Staged, 1 shard | [`43435185236`](https://github.com/ifhamm/QA-Assessment/actions/runs/43435185236) | 3 m 17 s | 8.7 | 203 KB |
| Staged, 3 shards | [`43435791291`](https://github.com/ifhamm/QA-Assessment/actions/runs/43435791291) | 3 m 07 s | 12.1 | Yes |

The three-shard run was produced by a temporary commit that defaulted the
matrix to three shards; it was reverted immediately afterwards. The run is
kept as evidence, and the merged report contains all five blobs (smoke, three
regression shards, visual).

**Honest conclusion:** for a 7-test suite, sharding is not worth it. Three
shards saved 10 s of wall time versus one shard but cost 3.4 extra
runner-minutes, because each shard repeats the Playwright install and the
self-hosted stack build. The required stage split is also more expensive than
the flat workflow at this size (8.7 vs 4.9 runner-minutes) for the same
reason. Keep the stages for isolation and future growth, keep the default at
one shard, and enable more shards when the regression stage is large enough
(roughly 30+ tests or more than ~5 minutes) that shard startup is amortized.

## How to verify

```powershell
npm run stack:up
npm run typecheck
npm run lint
npm run check:tags

npm run test:local            # 7 host tests, retries 0
npm run test:smoke            # 4 tests including setup
npm run test:regression       # 3 tests, no setup dependency
npm run test:visual           # 2 container-rendered tests

# Local shard + merged-report check (3 shards, sequential).
1..3 | ForEach-Object {
  $env:PLAYWRIGHT_BLOB_OUTPUT_DIR = "blob-report/shard-$_"
  npm run test:regression -- --shard="$_/3"
}
# Flatten every blob zip, then merge with the merge config.
npm run report:merge -- merged-blobs

npm run stack:down
```

In GitHub Actions, run the workflow manually with `shards: 3` to exercise the
matrix; pushes and pull requests use one shard.
