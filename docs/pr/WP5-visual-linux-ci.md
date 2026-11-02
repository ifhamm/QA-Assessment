# WP5: Visual Testing Done Right

## Summary

The two visual tests now run consistently in CI. They render only inside
`mcr.microsoft.com/playwright:v1.63.0-noble`, the same image that produced the
committed Linux baselines. The old Windows baselines were removed, a separate
`Visual Tests` CI job compares the screenshots, and a failed comparison uploads
the expected, actual, and diff images as the `visual-diffs` artifact.

To prove the gate still detects change, an experiment branch injected an
intentional red background into the login page. Only the `Visual Tests` job
failed; the API and Playwright jobs stayed green, and the diff was captured.
Diff thresholds, assertions, timeouts, and cleanup behavior are unchanged.

## Why

WP4 left the visual suite green on the Windows development machine but excluded
from CI. Its baselines were `*-chromium-win32.png`, so they encoded Windows font
rasterization and could never be compared on a Linux runner. WP5's acceptance
requires a real CI gate, a visible failure for an intentional UI change, an
unchanged threshold, and an explicit disposition for the Windows baselines.

The self-hosted stack from WP4 already provides the stable target. The missing
piece was a pinned renderer.

## What changed

### One rendering environment

- `docker-compose.yml`
  - Adds a `visual` service on the `visual` profile, so `stack:up` and the other
    jobs never start it.
  - Image `mcr.microsoft.com/playwright:v1.63.0-noble` matches
    `@playwright/test` `1.63.0` in `package-lock.json`.
  - Mounts the repository at `/work`, so tests and baselines are the same files
    used locally and in CI.
  - Reaches the app as `http://web` and the API as `http://web/api` over the
    compose network, avoiding host-port and host-font differences.
  - Sets `TZ=UTC`.
- `package.json`
  - `test:visual` → `test:visual:linux` → `docker compose --profile visual run
    --rm visual`.
  - `test:visual:linux:update` regenerates baselines in the same image.
  - `test` and `test:local` now select `setup`, `authenticated`, and `chromium`,
    so the default host run is the 7 non-visual tests. Visual tests are the
    second half of a full local check: `npm run test:visual`.

### Playwright configuration

- `playwright.config.ts`
  - New `visual` project with no `setup` dependency; it does not reuse the auth
    file.
  - `chromium` ignores `tests/visual`.
  - Fixed rendering inputs: 1280x720, light color scheme, UTC, `en-US`.
  - `expect.toHaveScreenshot` explicitly sets `animations: "disabled"`,
    `caret: "hide"`, and `scale: "css"`. Thresholds remain the Playwright
    defaults and were not relaxed.

### Baselines and test stabilization

- `tests/visual/*-snapshots/`
  - Deleted `*-chromium-win32.png`.
  - Added `*-visual-linux.png`, generated inside the pinned image.
- The editor screenshot already fixed and masked the generated username, so the
  navbar cannot shift with the length of the test user's name.
- The login page has no generated content; the screenshot waits for the heading
  and email field to be visible.

### CI and docs

- `.github/workflows/tests.yml`
  - New `Visual Tests` job: install dependencies, build/start the stack, run
    `npm run test:visual:linux`.
  - On failure, uploads `test-results/` and `playwright-report/` as
    `visual-diffs`.
  - Removes the stack with the `visual` profile enabled in an `always()` step.
- `README.md`
  - Container-only visual workflow, baseline-update rules, reviewer ownership,
    and threshold rule.
- `docs/decisions/WP5-visual-linux-ci.md`, `docs/metrics.md`,
  `docs/progress.md`, and this PR description.

## Evidence

### Local checks

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npx playwright test --list` | 9 tests in 6 files (7 host + 2 visual) |
| `npm run test:local` | 7 passed (19.6 s, 4 workers) |
| `npm run test:visual:linux` | 2 passed (7.4 s) |
| `--project=visual --repeat-each=5` | 10/10 passed (23.4 s) |
| Baseline dimensions | 1280x720 for both screenshots |

### Green CI run

[Run `41466040923`](https://github.com/ifhamm/QA-Assessment/actions/runs/41466040923)
on `7045feb`, push, **success** in 2 m 24 s:

| Job | Duration | Result |
| --- | ---: | --- |
| API Tests | 1 m 08 s | success |
| Playwright Tests | 2 m 14 s | success; 5 + 3 passed, no retry |
| Visual Tests | 1 m 50 s | success; 2 passed (1.9 s), no retry |

The final docs commit `d85fa39` was green again in
[run `41467922061`](https://github.com/ifhamm/QA-Assessment/actions/runs/41467922061)
(2 m 24 s: API 1 m 40 s, Playwright 2 m 20 s, Visual 1 m 50 s). The docs-only
follow-up `873e837` passed in
[run `41468501944`](https://github.com/ifhamm/QA-Assessment/actions/runs/41468501944)
(2 m 20 s: API 1 m 09 s, Playwright 2 m 16 s, Visual 1 m 46 s).

### Intentional failure

[Run `41466501007`](https://github.com/ifhamm/QA-Assessment/actions/runs/41466501007)
on experiment commit `7254cb3`, push, **failure in the Visual job only**:

| Job | Duration | Result |
| --- | ---: | --- |
| API Tests | 1 m 08 s | success |
| Playwright Tests | 2 m 42 s | success |
| Visual Tests | 1 m 49 s | **failure** (expected) |

The experiment branch added only this to the login test:

```ts
await page.addStyleTag({
  content: "body { background-color: #ff0000 !important; }",
});
```

The `visual-diffs` artifact (1.2 MB) contained the expected baseline, the actual
red render, and the pixel diff. The committed evidence is:

- [`docs/evidence/wp5-intentional-failure-diff.png`](../evidence/wp5-intentional-failure-diff.png)
- [`docs/evidence/wp5-intentional-failure-actual.png`](../evidence/wp5-intentional-failure-actual.png)

The experiment branch was deleted after the artifact was captured; the run and
artifact remain available. It was never merged.

## Risks and trade-offs

- Docker is now required for visual work, even on Windows. The image is about
  2 GB on first pull; a run takes 7-10 s warm and up to 2 min including stack
  startup in CI.
- The default host run no longer includes the two visual tests. That is
  deliberate: a host render would compare against the wrong environment.
  `npm run test:visual` is required for the full local acceptance.
- Google Fonts and Ionicons are still external. The container stabilizes the
  renderer, not the network. If those requests fail, the comparison fails
  visibly rather than silently changing the baseline. Vendoring the fonts is a
  possible follow-up if this proves noisy.
- The image tag and `@playwright/test` version are coupled manually. A future
  upgrade must update both and regenerate baselines in the same commit.
- A pixel diff only says that pixels changed. The PR reviewer still owns the
  decision that a baseline change is intentional; the README states this rule.

## Rule checklist

- [x] One work package, one branch, one PR.
- [x] No assertion lowered, removed, or loosened.
- [x] No `test.skip`, `test.fixme`, `waitForTimeout`, sleep, or timeout increase.
- [x] No visual threshold change; Playwright defaults retained.
- [x] Baselines regenerated only in the same environment as CI.
- [x] Old Windows baselines removed and explained.
- [x] Intentional UI change fails with a visible diff and an artifact.
- [x] Typecheck passes; local host and visual suites pass.
- [x] Local evidence uses `retries: 0`; CI green run consumed no retry.
- [x] No secrets committed; all test data is synthetic.
- [x] Before/after metrics and a decision note are included.
- [x] PR is opened by the owner; not merged by the agent.

## How to verify

```powershell
npm run stack:up

npm run typecheck
npm run test:local          # 7 host tests
npm run test:visual         # 2 tests in the pinned container

# Determinism probe.
docker compose --profile visual run --rm visual `
  node node_modules/@playwright/test/cli.js test --project=visual `
  --repeat-each=5 --reporter=line

npm run stack:down
```

Expected: 7 host tests pass, 2 visual tests pass, and the repeat probe passes
10/10. The CI `Visual Tests` job is green, and the experiment run above shows
the intentional red render failing with a diff.

## Open questions

1. PR [#6](https://github.com/ifhamm/QA-Assessment/pull/6) contains the WP4 docs
   follow-up, which this branch already includes as commit `96945c9`. Merge #6
   first or close it as superseded so the history is not duplicated.
2. Should a later work package vendor the Google Fonts/Ionicons assets to remove
   the last external dependency from the visual render?
