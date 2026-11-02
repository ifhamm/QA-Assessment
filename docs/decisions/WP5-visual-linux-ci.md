# WP5 — Visual Testing Done Right

- **Date:** 2026-11-02
- **Branch:** `wp5/visual-linux-ci`
- **Base:** `main` at `494d243` (WP4 merge), including the WP4 docs follow-up
- **Owner decision:** make the visual suite a trustworthy gate in CI, not a
  local-only check.

## Context

WP4 left two visual tests that passed on the Windows development machine but
never ran in CI. Their baselines were `*-chromium-win32.png`, so they encoded
Windows font rendering. WP5's acceptance requires the tests to be green in CI,
to fail visibly for an intentional UI change, to keep the diff threshold
unchanged, and to remove or explain the old Windows baselines.

The self-hosted stack from WP4 is already the test target. The missing piece is
a deterministic renderer and a CI job that uses it.

### Sources of instability identified

| Source | Observation |
| --- | --- |
| OS / font rasterization | Windows and Linux produce different glyph shapes and metrics; the old baselines were Windows-only. |
| Web fonts | The app loads Titillium Web, Lora, and Source Sans Pro from Google Fonts, and Ionicons from `code.ionicframework.com`. A slow or blocked request changes the rendering. |
| Dynamic identity | The editor screenshot contains the generated username in the navbar; its length and text change per run. |
| Motion | Angular route transitions and CSS transitions can be captured mid-frame. |
| Viewport / page height | `fullPage` screenshots depend on the viewport and on layout shifts while content settles. |

## Options considered

| Option | Assessment |
| --- | --- |
| Keep the Windows baselines and add Linux ones — rejected | Two sources of truth. A local Windows green would not prove CI green, and every intentional change would need two regenerations. |
| Run visual tests on `ubuntu-latest` and generate baselines from a CI artifact — rejected | The runner image and its installed fonts change independently of the repository. The baseline would drift whenever GitHub updates the image. |
| Run visual tests only in the official Playwright image — **chosen** | The image pins the browser build, OS libraries, and fonts. The same command produces and compares baselines locally and in CI. |
| Vendor the web fonts into the app image — rejected | It changes the product under test and adds binary assets; the remaining external requests are visible as diffs if they fail. |

## Decision

### One rendering environment

`docker-compose.yml` adds a `visual` service:

- image `mcr.microsoft.com/playwright:v1.63.0-noble`, which must match the
  `@playwright/test` version in `package-lock.json`;
- profile `visual`, so `stack:up` and the other jobs do not start it;
- the repository mounted at `/work`, so it uses the same tests and baselines;
- `BASE_URL=http://web` and `API_BASE_URL=http://web/api` over the compose
  network, not the host ports;
- `TZ=UTC`.

`npm run test:visual` is the supported entry point. It runs
`--project=visual` inside that container. `npm run test:visual:linux:update`
regenerates baselines in the same image.

### Baselines

Both baselines were regenerated in the container as
`*-visual-linux.png`. The old `*-chromium-win32.png` files were deleted. Keeping
them would imply that a Windows-only run is meaningful; it is not, because CI
renders on Linux.

The files are named after the Playwright project (`visual`), not the browser,
which makes the environment explicit in the filename.

### Playwright configuration

- `visual` is a separate project with no `setup` dependency; visual tests do
  not reuse the stored auth file.
- `chromium` ignores `tests/visual`, and the `test` / `test:local` scripts run
  only `setup`, `authenticated`, and `chromium`. A host run therefore executes
  seven tests, and the container adds the two visual tests.
- `expect.toHaveScreenshot` sets `animations: "disabled"`, `caret: "hide"`, and
  `scale: "css"` explicitly. The diff thresholds are the Playwright defaults and
  were not changed.
- `use` fixes `colorScheme: "light"`, `timezoneId: "UTC"`, and
  `locale: "en-US"` so the rendered page cannot depend on host preferences.
- The viewport was already fixed at 1280x720.

### Test-level stabilization

- The editor test hides the username link, fixes its width to 120px, and masks
  it. Hiding the text alone would leave the navbar layout dependent on the
  generated name's width; the fixed width prevents that shift.
- The login page has no generated content; the screenshot runs after the
  heading and email field are visible.
- Full-page screenshots at a fixed viewport are used for both pages.

### CI

A third job, `Visual Tests`, builds the stack and runs
`npm run test:visual:linux`. On failure it uploads `test-results/` and
`playwright-report/` as the `visual-diffs` artifact, which contains the
expected, actual, and diff images. The stack is removed in an `always()` step
with the `visual` profile enabled.

## Trade-offs

- Docker is now required for visual work, even on Windows. The image is large
  (about 2 GB on first pull), but it removes OS-specific baselines.
- The default local run no longer includes the two visual tests. That is
  deliberate: a host-rendered visual run would compare against the wrong
  environment. `npm run test:visual` is the second half of a full local check.
- Google Fonts and Ionicons remain external. The container makes the renderer
  stable, not the network. If those requests fail, the screenshot differs and
  the job fails; that is preferable to silently changing the baseline. A future
  WP can vendor the fonts if this proves noisy.
- The image tag and `@playwright/test` version are coupled manually. Updating
  either requires updating the other and regenerating the baselines in the same
  commit.
- A baseline diff only says "pixels changed". Reviewing the image is still a
  human responsibility, which is why the README assigns that decision to the
  PR reviewer.

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
10/10. The CI `Visual Tests` job must be green, and the experiment branch must
produce a visible diff.
