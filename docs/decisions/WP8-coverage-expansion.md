# WP8 - Coverage Expansion: Negative Tests and Cross-Browser Smoke

Status: implemented on `wp8/coverage-expansion`, plan approved 2026-11-14.
Owner approval was given in the working session after the scope options were
reviewed; the recommended balanced scope was selected, with the delete-article
UI test included because WP1 explicitly deferred it to WP8.

## Problem

WP8 is the optional stretch package. Before it, the suite already covered two
of the PRD's three negative examples (invalid credentials and unauthenticated
access to the editor), so re-testing them would add noise. The actual gaps
were:

- no test for client-side form gating, empty-article validation, logout, or a
  stale/invalid stored token;
- no destructive UI path even though `ArticlePage.deleteButton` existed unused
  since WP1;
- no browser other than Chromium;
- the Newman collection had no duplicate-registration or malformed-token case.

## Test-by-test level decision

Each case was placed at the lowest level that can prove the behavior. The PRD
asks for this reasoning explicitly; it is recorded here instead of in code
comments only.

| Case | Level | Why this level |
| --- | --- | --- |
| Sign up stays disabled until all fields are filled | UI | Browser control state and Angular form validity. An API test cannot observe a disabled button. |
| Empty article shows `title/description/body can't be blank` | UI | The publish button is not disabled, so the value is the inline error rendered after submission. |
| Logout clears the token and protects `/editor` | UI | localStorage state and the route guard after a client-side logout. |
| Invalid stored token is treated as logged out | UI | App bootstrap behavior: a syntactically invalid JWT in `localStorage` must not produce a half-authenticated navbar. The server side of the same rule is covered by the API test below. |
| Delete an owned article through the UI | UI | Destructive-action wiring and redirect. The API delete endpoint was already covered; this closes the WP1 deferral. |
| Duplicate registration returns `409` with both field errors | API | Server contract. A UI test would only re-read the same error body and be slower. |
| Malformed token returns `401` | API | Auth boundary; assert status and error body directly. |
| Invalid email / short password | none | The self-hosted API accepts both (`201`). Asserting a validation rule the product does not enforce would be a fake test; inventing the rule is out of scope. |
| Dashboard without a session | none | Already implied by the route-guard test; a separate test would only duplicate the same redirect. |

## Cross-browser design

- Two Playwright projects, `firefox-smoke` and `webkit-smoke`, run only
  `@smoke` (`grep: /@smoke/`) and ignore the visual directory.
- Both reuse the API-built `storageState`. The setup project uses only the
  `request` fixture, so no extra engine is needed to create the state.
- CI adds one `Browser Smoke` job with a `[firefox, webkit]` matrix,
  `fail-fast: false`, a per-engine browser cache key, and a separate blob and
  results artifact per engine. Chromium stage timings are untouched because the
  job runs in parallel.
- Both blobs join the existing merged report, and the `Quality Gate` reads one
  aggregated `browser` stage result. A failure on either engine blocks the gate.
- Visual baselines stay Chromium-only: a Firefox/WebKit baseline set would
  multiply the reviewed images for little signal at this suite size.

## Counts

| Item | Before WP8 | After WP8 |
| --- | ---: | ---: |
| Playwright tests (definitions) | 9 | 14 |
| Host tests (incl. setup) | 7 | 12 |
| `@smoke` / `@regression` / visual / setup | 3 / 3 / 2 / 1 | 3 / 8 / 2 / 1 |
| Newman requests / assertions | 15 / 53 | 17 / 57 |
| CI jobs | 8 | 10 (browser smoke is a 2-engine matrix) |

The user-facing count is 13 (3 smoke + 8 regression + 2 visual); the 14th
execution is the setup project.

## Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run check:tags` | 9 `@smoke` listings (3 tests × 3 projects), 8 `@regression`, 2 visual |
| New tests, `--repeat-each=10` (retries 0) | 50/50 passed |
| New tests, second `--repeat-each=20` batch (retries 0) | 100/100 passed |
| Full local suite (`npm run test:local`) | 12/12 passed, 12.3 s warm |
| Cross-browser smoke | 3 tests on each engine, 7/7 including setup, 25.9 s |
| Cross-browser `--repeat-each=10` | 61/61 including setup, 2.8 min |
| `npm run test:api:local` | 17 requests / 57 assertions, 0 failed, 2.9 s |

One cold full-suite run failed the registration-gating test while the machine
was still busy with the preceding browser workload. It did not reproduce in the
next run or in 150 consecutive retry-free repeats. The test asserts only the
button's disabled/enabled state and the URL, so no timeout, sleep, or assertion
was relaxed; the incident is recorded here rather than hidden.

## Trade-offs and risks

- **Cost.** Two extra parallel jobs each build the stack. Wall time should stay
  flat; summed runner-minutes rise by roughly two stack builds. The measured CI
  numbers are in `docs/metrics.md` once the PR run completes.
- **WebKit on Linux.** The CI job installs WebKit with `--with-deps`; the host
  probe used the Windows WebKit build. Both exercise the same project and the
  same assertions, but the CI run is the authoritative image.
- **Retry policy.** CI still uses one retry as an infrastructure net. A browser
  test that only passes on retry is listed as flaky and blocks nothing, per the
  existing policy.
- **Cleanup.** `deleteArticle` now treats `404` as success. A UI test that
  deletes its own article must not turn teardown into a warning. No assertion
  behavior changed.
