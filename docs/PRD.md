# PRD: QA-Assessment Framework Improvement

*Working document for the implementing AI agent. Focus: strengthen the existing framework. No AI/agentic features in this scope.*

## 1. Context & Goals

The repo `ifhamm/QA-Assessment` is a QA automation portfolio for the Conduit (RealWorld) application: API tests (Postman/Newman), UI tests (Playwright + TypeScript), cross-layer tests, visual regression, and performance tests (k6), with CI on GitHub Actions. The foundation is solid. This document defines the improvements that make the framework more stable, faster, easier to debug, and stronger as an SDET portfolio.

**Important:** the description of the current state below was written from the README, not from the code. The agent **must verify it against the actual repo** before changing anything (see WP0) and record every difference.

**Goals:**

- Stable tests: they fail only because of product defects, not because of random test behavior.
- Faster execution in parallel, without data collisions.
- Visual tests that actually run in CI.
- A staged CI pipeline with a merged report and clear quality gates.
- Every technical decision documented, because the repo owner will learn by reverse engineering the agent's work.

**Success is measured by:** before/after metrics (section 6), green CI, and a decision note for every work package.

## 2. Scope

**In scope:** the Playwright framework (fixtures, auth, test data, workers, reliability), visual testing, CI/CD (stages, sharding, reporting, quality gates), documentation, and limited coverage additions (negative UI tests and cross-browser as stretch).

**Out of scope, do not do:**

- AI/agentic features: `AGENTS.md`, skills, Playwright MCP, self-healing, failure triage agents.
- Database/SQL verification.
- Changes to the application under test.
- Large rewrites of the Postman and k6 suites (small fixes are allowed if they block CI).
- Adding third-party tools or dashboards (Allure, etc.) unless requested.

## 3. Rules for the Implementing Agent

- One work package = one branch = one PR. Small commits with clear messages (conventional commits).
- **Forbidden** just to turn a test green: lowering or removing assertions, `test.skip`/`test.fixme` without a written reason, raising timeouts to hide flakiness, `waitForTimeout`/sleeps, changing expected values, updating snapshots without explanation, or loosening the visual threshold.
- Before every commit: typecheck passes and all related tests pass locally.
- Record before/after metrics for each WP in `docs/metrics.md`.
- Write a short decision note per WP in `docs/decisions/WPn-<slug>.md` with: Context, Options considered, Decision, Trade-offs, How to verify.
- Explain **WHY**, not only WHAT. The owner learns by dissecting your work. Add code comments only where the code is not obvious.
- If something is ambiguous, stop and write the question in the PR description. Do not guess silently.
- Never commit secrets or credentials. Test data must be synthetic.

## 4. Execution Protocol

- This PRD lives in the repo at `docs/PRD.md`. At the start of every WP, re-read that WP's section and `docs/progress.md`. Assume you have no memory of earlier sessions.
- Work on **exactly one WP at a time**, in the order given in section 5. Never start a WP the owner has not explicitly approved.
- **Plan first** for WP1, WP3, and WP6: post a short plan (files to touch, approach, alternatives, risks) as a PR comment and **wait for the owner's approval** before writing code. For the other WPs, proceed directly but still write the decision note.
- When a WP's acceptance criteria are met: open a PR, fill in the PR description (section 8), update `docs/progress.md`, then **stop and report**. Do not merge your own PR and never push to `main`.
- Do not pull work forward from later WPs. Unrelated improvements go into a Follow-ups list in the PR, not into the diff.
- If the PRD conflicts with the repo's reality, or a WP cannot be completed as written, stop and report instead of improvising scope.
- Keep diffs reviewable. Put refactor-only changes and behavior-changing changes in separate commits.

## 5. Order, Dependencies & Milestones

Order: WP0 → WP1 → WP2 → WP3 → WP4 → WP6 → WP7 → WP9.

WP5 (visual) can run in parallel after WP0 and must be done before WP6. WP8 is optional (stretch) and comes after WP4.

The agent stops after every WP. Milestones group WPs into visible results:

- **M1, after WP0-WP2:** audited baseline, fixtures in place, UI login steps removed from most tests.
- **M2, after WP3-WP4:** isolated test data and a suite that is green 10 times in a row with 4 workers.
- **M3, after WP5:** visual tests running in CI with a proven failure path.
- **M4, after WP6-WP7:** staged pipeline, one merged report, written quality gates.
- **M5, after WP8-WP9:** extended coverage (optional) and a polished, evidence-backed README.

## 6. Baseline Metrics

Measured in WP0 and re-measured in every relevant WP:

- Number of tests per layer (API, UI, cross-layer, visual).
- UI suite duration locally and in CI, and total CI pipeline duration.
- Result of `--repeat-each=10` on the UI suite (number of flaky tests).
- Number of UI logins per run.
- Tests that run in CI versus tests excluded from CI (e.g. visual).
- Report quality: how quickly the cause of a failure can be found (qualitative).

## 7. Work Packages

### WP0: Baseline & Audit

**Goal:** understand the actual state before changing anything.

**Tasks:**

- Map the real repo structure (folders, config, CI workflow), compare it with the README claims, and record the differences.
- Run the entire suite (API, UI, cross-layer, visual, k6 smoke) locally and record results and durations.
- Run the UI suite with `--repeat-each=10` to find flaky tests.
- For every abstraction (page object, component, helper, generator) write one sentence: why it exists and whether it is still needed. Include a decision on the navbar component.
- List the main problems, prioritized.

**Acceptance:** `docs/audit.md` and `docs/metrics.md` (baseline) exist; no test behavior has changed.

**Evidence:** the baseline table.

### WP1: Fixtures & Abstraction Boundaries

**Goal:** setup/teardown is owned by fixtures, not test bodies, and every abstraction has a reason to exist.

**Tasks:**

- Create custom fixtures with `test.extend` for the main page objects and an API client.
- Move repeated setup/cleanup (creating a user/article via API and cleaning it up) into fixtures with a clear lifecycle. Cleanup must still run when the test fails.
- Define and apply role boundaries for page objects, components, API helpers, and fixtures. Merge or remove abstractions without a strong reason.
- Refactor at least 3 tests to use fixtures without changing their assertion intent.

**Acceptance:** behavior and assertion count are unchanged; no duplicated setup remains in the refactored tests; the decision note explains the difference between `beforeEach`, test fixtures, and worker fixtures, and the choice made.

**Evidence:** a before/after diff of one test, plus the decision note.

### WP2: Reuse Auth State

**Goal:** remove repeated UI logins.

**Tasks:**

- Authenticate via API (or once via UI), save to `storageState`, and add the state file to `.gitignore`.
- Create a Playwright setup project that produces the state, and reuse it in tests that need a logged-in user.
- Keep at least one test that exercises the UI login flow explicitly.
- Document when auth should be per-test, per-worker, or shared, and why the chosen option fits.

**Acceptance:** non-login tests no longer log in via the UI; state is not committed; the UI login test still exists and passes; expired state does not make tests brittle.

**Evidence:** reduced duration and reduced number of UI logins.

### WP3: Test Data Architecture

**Goal:** every test owns its data and is isolated.

**Tasks:**

- Tidy the data factories: unique per test and per worker.
- Apply one standard pattern inside fixtures: setup via API, test, cleanup via API.
- Ensure no test depends on data or state from another test, or on execution order.
- Make sure cleanup is still attempted when a test crashes (best effort, and logged).

**Acceptance:** every test can run alone (`--grep`) and with `fullyParallel: true`; no hard-coded emails, usernames, or slugs that can collide.

**Evidence:** results of running a single test alone and of a full parallel run.

### WP4: Parallelism & Reliability

**Goal:** a faster suite with more than 1 worker that stays stable.

**Tasks:**

- Raise `workers` (try 2 and 4) and enable `fullyParallel` where safe. Record which tests fail and the root cause (usually data collisions or shared state).
- Fix the root cause. Do **not** lower workers or add retries to hide it.
- Audit locators (prefer role, label, test id), web-first assertions, and auto-waiting. Remove every `waitForTimeout`.
- Run `--repeat-each=10` on the full UI suite until it is clean.
- Configure retries for CI only (maximum 1-2) and capture a trace on the first retry.
- Benchmark workers 1, 2, and 4.

**Acceptance:** 10 consecutive green runs with 4 workers and no retries; zero `waitForTimeout`; a benchmark table in `docs/metrics.md`.

**Evidence:** the benchmark table, the list of flaky tests found, and their root causes.

### WP5: Visual Testing Done Right

**Goal:** visual regression that runs consistently in CI.

**Tasks:**

- Identify sources of instability: fonts, animations, dynamic content (dates, avatars, lists), viewport, and OS/rendering differences.
- Stabilize: `animations: 'disabled'`, fixed viewport, masking of dynamic elements, and deterministic data on screenshotted pages.
- Regenerate baselines in the same environment as CI (Linux, using the official Playwright image/container at the same version as the repo's Playwright).
- Run it as a separate CI job and upload diffs as artifacts on failure.
- Write README rules: when a baseline may be updated, who reviews it, and how to update it.

**Acceptance:** visual tests are green in CI; an intentional UI change (on an experiment branch) fails with a visible diff; the threshold is not loosened without a written justification; the old Windows baselines are removed or explained.

**Evidence:** a screenshot of the intentional failure's diff and one green CI run.

### WP6: Staged CI Pipeline & Sharding

**Goal:** a layered pipeline that can scale.

**Tasks:**

- Tag tests (`@smoke`, `@regression`) and apply the tags consistently.
- Split the workflow into: typecheck/lint, API, UI smoke, UI regression (visual as its own job), then report.
- Apply sharding (e.g. 3 shards via a matrix) and merge the results with the blob reporter and `merge-reports` into one HTML report.
- Cache dependencies and Playwright browsers.
- Compare three configurations: workers 1, workers 4 on one machine, and 3 shards. Record duration and total CI minutes.

**Acceptance:** the pipeline is green; one merged report is available as an artifact; the workers vs sharding comparison is documented with data, including an honest conclusion about when sharding pays off and when its overhead is not worth it for a suite this small.

**Evidence:** a pipeline diagram in the README and the comparison table.

### WP7: Reporting & Quality Gates

**Goal:** when something fails, an engineer immediately knows what to look at first.

**Tasks:**

- Add reporters: merged HTML, JUnit, and a GitHub Actions job summary (counts of passed, failed, and flaky tests, plus the failed tests with links to artifacts).
- Configure artifacts: trace on retry, screenshot on failure, video only when needed.
- Define a written quality gate policy: smoke failure blocks; regression failure blocks merge; flaky (passes on retry) raises a warning that must be investigated; visual diff requires human review.
- Make sure flaky tests are visible and not hidden by retries.

**Acceptance:** the job summary shows a useful overview; the gate policy is documented and implemented in the workflow; an intentional failure can be traced from the summary to its trace in a few clicks.

**Evidence:** a job summary screenshot and the gate policy document.

### WP8: Coverage Expansion (Stretch)

**Tasks:**

- Add negative UI tests (form validation, wrong credentials, access without login) using the existing fixtures and data factories.
- Run a smoke subset on Firefox and WebKit as a separate project, without slowing the main path.
- For each new test, consider whether it belongs at the API level instead of E2E, and record the reasoning.

**Acceptance:** new tests follow the WP1-WP3 conventions; they are stable under `--repeat-each=10`; the CI duration impact is recorded.

### WP9: Documentation & Portfolio Polish

**Tasks:**

- README: a results summary at the top (test counts, layers, CI status), a CI badge, architecture and pipeline diagrams, a before/after metrics table, and local run instructions.
- Update Design Decisions and Known Limitations to match the current state.
- Fill in the repo About section (short description and topics).
- Create an index in `docs/` linking the audit, metrics, and all decision notes.

**Acceptance:** a newcomer can clone the repo and run the suite from the README alone; every claim in the README matches the actual repo.

## 8. Definition of Done (all WPs)

- Related tests are green locally and in CI; no test was deleted or skipped without a written reason.
- Before/after metrics are recorded.
- A decision note exists and explains the trade-offs.
- The PR description contains: what changed, why, how to verify, evidence (logs/screenshots), and open questions.
- No rule in section 3 was violated.

## 9. Risks & Pitfalls

- Data collisions when workers are raised. Do not solve them by going back to 1 worker.
- Visual baselines created on a different OS than CI.
- Auth state that expires or gets committed.
- Retries that hide flakiness.
- Over-engineering: every new abstraction needs a written reason.
- If the application under test is a public instance, it may change or rate-limit. Record failures that come from the environment rather than from the tests.

## Appendix A: Kickoff Prompts

First session (copy and paste to the agent):

```text
You are the implementing agent for the repository ifhamm/QA-Assessment.

Read docs/PRD.md in full, especially section 3 (rules) and section 4 (execution protocol).

Start with WP0 (Baseline & Audit) only. Do not change any test behavior in WP0.
When WP0's acceptance criteria are met, open a PR, summarize the findings and metrics, list every place where the repo differs from what the PRD assumes, and STOP. Do not start WP1 until I explicitly approve.
If anything is ambiguous, ask in the PR description instead of guessing.
```

Every later session:

```text
WP<previous> is approved and merged. Proceed with WP<next> only.
First re-read the WP<next> section of docs/PRD.md and docs/progress.md.
For WP1, WP3, and WP6: post your plan as a PR comment and wait for my approval before writing code.
When the acceptance criteria are met, open a PR and STOP.
```
