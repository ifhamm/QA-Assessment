## WP8 - Coverage Expansion: Negative Tests and Cross-Browser Smoke

Optional stretch package, plan approved 2026-11-14. This PR closes the coverage
gaps left by WP2/WP3 without re-testing behavior that was already covered.

### What changed

- **Five browser negatives** in `tests/ui/negative.spec.ts`:
  - sign-up stays disabled until every field is filled;
  - empty article shows `title/description/body can't be blank` and stays on
    `/editor`;
  - logout clears the token, logs the navbar out, and protects `/editor`;
  - an invalid stored JWT is treated as logged out;
  - deleting an owned article through the UI removes it at the API too.
- **Two Newman negatives**: duplicate registration (`409`, both field errors)
  and malformed token (`401`, `token is invalid`).
- **Cross-browser smoke**: `firefox-smoke` and `webkit-smoke` projects run the
  three `@smoke` tests with the existing API-built storage state.
- **CI**: a separate `Browser Smoke` matrix job (`fail-fast: false`, one browser
  cache key and one blob/results artifact per engine), merged into the existing
  report and folded into `Quality Gate` as one `browser` stage.
- **Cleanup**: `deleteArticle` treats `404` as success so a UI test that deletes
  its own article does not warn during teardown.

### Level decisions

| Case | Level | Rationale |
| --- | --- | --- |
| Registration gating, empty publish, logout, invalid stored token, delete | UI | Disabled controls, inline errors, localStorage, and route guards are browser behavior. |
| Duplicate registration, malformed token | API | Status code and error body are server contracts. |
| Invalid email, short password | not added | The API accepts both; asserting a rule the product does not enforce would be a fake test. |

### Counts

| Item | Before | After |
| --- | ---: | ---: |
| Playwright tests (definitions) | 9 | 14 |
| Host tests (incl. setup) | 7 | 12 |
| `@smoke` / `@regression` / visual | 3 / 3 / 2 | 3 / 8 / 2 |
| Newman requests / assertions | 15 / 53 | 17 / 57 |
| CI jobs | 8 | 10 |

### Local evidence (retries 0)

| Check | Result |
| --- | --- |
| `npm run typecheck`, `npm run lint`, `npm run check:tags` | exit 0; 9 smoke listings (3 tests × 3 projects), 8 regression, 2 visual |
| New tests `--repeat-each=10` | 50/50 |
| New tests `--repeat-each=20` | 100/100 |
| Full suite (`npm run test:local`) | 12/12 |
| Cross-browser smoke | 7/7 including setup |
| Cross-browser `--repeat-each=10` | 61/61 |
| `npm run test:api:local` | 17 requests / 57 assertions, 0 failed |

### CI evidence

| Run | Result |
| --- | --- |
| PR run [`43616194626`](https://github.com/ifhamm/QA-Assessment/actions/runs/43616194626) | green; 2 m 58 s wall, 712 s summed, `Quality Gate` 7 s; 22 merged Playwright results (0 failed, 0 flaky); `browser` stage `success` |

The browser legs took 122 s (Firefox) and 110 s (WebKit), next to UI Smoke at
114 s. Wall time moved from 169 s to 178 s; summed runner time rose from 463 s to
712 s for the two extra stack builds.

One cold full-suite run failed the registration-gating assertion while the host
was still busy with the preceding browser workload; it did not reproduce in the
next run or in 150 consecutive retry-free repeats. No timeout, sleep, or
assertion was relaxed. The incident is recorded in the decision note.

### Risks

- Two extra parallel jobs add roughly two stack builds of runner-minutes; wall
  time stayed flat in the PR run. The measured numbers are in `docs/metrics.md`.
- WebKit is installed with `--with-deps` on `ubuntu-latest`; the local probe
  used the Windows build. The PR run confirms the Linux image.
- Visual baselines remain Chromium-only by design.
