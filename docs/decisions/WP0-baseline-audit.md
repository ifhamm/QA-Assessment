# WP0 — Baseline & Audit

## Context

The owner confirmed that `https://github.com/ifhamm/QA-Assessment` is the authoritative repository. An earlier audit draft was taken against a local reduced snapshot; it was discarded and this audit was re-run against a fresh clone of `main` at `c5ec4f2`.

The goal of WP0 is to establish a trustworthy "before" picture. The audit found that the repository is substantially ahead of the PRD's description: fixtures, auth setup, storage state, and a dashboard already exist, while CI is red because the setup project requires credentials the workflow does not provide.

After reviewing the findings, the owner answered "all yes" to the five WP0 questions. That expanded the closeout to a minimal, behavior-neutral CI unblock and a rescope note for WP1/WP2.

## Options considered

1. **Leave WP0 strictly documentation-only.**
   - Keeps the diff and the "no behavior change" rule trivially true.
   - Leaves CI deterministically red at the setup step, so the owner cannot see the real test results.

2. **Minimal CI unblock: supply synthetic auth credentials in the workflow (chosen).**
   - Add `AUTH_EMAIL`/`AUTH_PASSWORD` to the Playwright job, overridable with repository variables.
   - Add the missing `.env.example` and document the auth variables in the README.
   - Does not touch test code, page objects, fixtures, API helpers, assertions, or the `test:ui` script.
   - Lets the existing setup fallback run when the synthetic credentials do not authenticate.

3. **Fix the test suite's reliability problems in WP0.**
   - Attempted: API read-after-write polling, UI reload polling, and creating the update fixture through the UI.
   - Rejected: these are WP4 (reliability/parallelism) changes, they exceed WP0's acceptance criteria, and they cannot make a shared public demo deterministic without retries or longer timeouts.
   - The experiments were reverted; the evidence is recorded in `docs/audit.md` and `docs/metrics.md`.

4. **Add the dashboard to CI immediately.**
   - Approved in principle, but it is a coverage change and exposed an auth-state/public-app flake.
   - Deferred to WP2 (auth state) or WP6 (pipeline) rather than hiding the flake in WP0.

5. **Regenerate visual baselines on Linux and run visual tests in CI now.**
   - Rejected for WP0. The PRD explicitly assigns this to WP5; Windows baselines remain local-only for now.

6. **Re-run later work packages because the PRD assumes fixtures/auth do not exist.**
   - Rejected. The repo already has `fixtures/test-base.ts`, `tests/auth.setup.ts`, `storageState`, and a dashboard test. Redoing them would duplicate work and pull WP1/WP2 forward.

## Decision

- Use the public repository as the source of truth; record the audited commit `c5ec4f2`.
- Keep the audit documentation in `docs/` and add `docs/PRD.md` because the repository did not contain the input document.
- Apply only the minimal CI unblock:
  - `.github/workflows/tests.yml` supplies synthetic `AUTH_EMAIL`/`AUTH_PASSWORD` for the Playwright job, overridable with repository variables.
  - `.env.example` documents all four environment variables.
  - `README.md` documents the auth variables and the setup fallback.
- Do **not** change tests, page objects, fixtures, API helpers, assertions, workers, retries, reporters, snapshots, or visual thresholds.
- Keep `test:ui` functional-only for now. The dashboard, full-UI script, and cross-layer fixture migration move to WP2/WP6/WP1 as appropriate.
- Re-evaluate `NavBar` in WP1. It is thin but reused by functional, cross-layer, and visual tests and owns a single coherent responsibility.
- Do not hide public-environment failures with retries, sleeps, timeout increases, skips, or threshold changes. Record them and ask for a policy decision.

## Owner decisions (2026-10-29)

1. **Fix the CI auth-env failure:** yes, via the minimal workflow/env change above.
2. **Add `dashboard.spec.ts` to CI:** yes in principle, deferred to WP2/WP6 because it is a coverage change and exposed a flake.
3. **Add `.env.example`:** yes, applied.
4. **Are WP1/WP2 partially done:** yes; rescope them in their own plans before coding.
5. **Visual Linux baselines in CI:** yes in principle, deferred to WP5 as the PRD specifies.

## Trade-offs

- This is no longer a documentation-only PR: it contains a workflow change, `.env.example`, and a README edit. It still contains no test behavior change.
- CI is not reliably green. The auth-env blocker is gone, but the shared public app/API intermittently returns 404/401 across replicas, and the dashboard auth state failed once in CI. A single green run is possible but is not proof of stability.
- The local baseline depends on the shared public app/API. Durations should be treated as indicative, not deterministic.
- The PRD's sequence no longer matches the repository. WP1/WP2 are partially implemented; the next WP needs explicit rescoping rather than blindly following the old plan.

## How to verify

1. `git diff --stat origin/main...wp0/baseline-audit` — docs, `.github/workflows/tests.yml`, `.env.example`, and `README.md` only. No `tests/`, `pages/`, `fixtures/`, or `api/` files.
2. `npm run typecheck` — exit 0.
3. `npx playwright test --reporter=list` — 9 passed (1.4 min reported / 88.0 s wall on the clean branch).
4. `npx playwright test tests/ui --repeat-each=10 --reporter=list` — 41 passed (baseline probe).
5. `npm run test:api` — 15 requests, 53 assertions, 0 failed (baseline).
6. `cd performance && npm ci && npm start` then `npm run test:perf` — all thresholds pass (baseline).
7. Open PR #1's checks. Confirm the setup project now starts, and compare the environment failures in `docs/audit.md` section 14.
