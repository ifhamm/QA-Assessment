# WP0 — Baseline & Audit

## Context

The owner confirmed that `https://github.com/ifhamm/QA-Assessment` is the authoritative repository. An earlier audit draft was taken against a local reduced snapshot; it was discarded and this audit was re-run against a fresh clone of `main` at `c5ec4f2`.

The goal of WP0 is to establish a trustworthy "before" picture without changing behavior. The audit found that the repository is substantially ahead of the PRD's description: fixtures and auth setup already exist, while CI is currently red.

## Options considered

1. **Audit the real repository and change documentation only (chosen).**
   - Clone `main`, run every suite locally, inspect CI history and logs, and record what exists.
   - Leave the CI failure as a finding rather than fixing it in an audit WP.

2. **Fix the CI auth-env failure in WP0.**
   - Would make the PR checks green.
   - Would change `tests/auth.setup.ts` or the workflow, which is not audit-only and overlaps WP2 (auth state).
   - Would hide the baseline problem the owner asked to document.

3. **Re-run later work packages because the PRD assumes fixtures/auth do not exist.**
   - The repo already has `fixtures/test-base.ts`, `tests/auth.setup.ts`, `storageState`, and a dashboard test.
   - Redoing them would duplicate existing work and pull WP1/WP2 forward.

## Decision

- Use the public repository as the source of truth; record the audited commit.
- Change documentation only. Add `docs/PRD.md` because the repository did not contain the input document.
- Do **not** fix the CI failure in WP0. Report it as a P0 blocker with the exact log line and a proposed minimal follow-up.
- Keep the current `NavBar` component. It is thin, but it is reused by UI functional, cross-layer, and visual editor tests and owns a single coherent responsibility. Re-evaluate in WP1 after fixture boundaries are applied; if it remains assertion-only, fold it into a fixture/helper instead of growing it into a page object.
- Do not change workers, retries, reporters, visual thresholds, or assertions.

## Trade-offs

- The PR will likely fail CI for a pre-existing reason (missing `AUTH_EMAIL`/`AUTH_PASSWORD`). This is honest but inconvenient. Fixing it would require touching auth setup or the workflow, which the owner has not approved as part of an audit.
- The local baseline depends on the shared public app/API. One UI-layer run was noticeably slower (setup 14.5 s, create 17.6 s) than the full-suite run (setup 8.0 s, create 11.9 s). Durations should be treated as indicative, not deterministic.
- The PRD's sequence no longer matches the repository. WP1/WP2 are partially implemented; the next WP needs explicit rescoping rather than blindly following the old plan.
- Adding `docs/PRD.md` makes the PR self-contained, but it also introduces the working document into the repository. The PRD itself says it lives at `docs/PRD.md`, so this is consistent.

## How to verify

1. `git diff --stat origin/main...wp0/baseline-audit` — only `docs/` files.
2. `npm run typecheck` — exit 0.
3. `npx playwright test --reporter=list` with the synthetic `.env` — 9 passed.
4. `npx playwright test tests/ui --repeat-each=10 --reporter=list` — 41 passed.
5. `npm run test:api` — 15 requests, 53 assertions, 0 failed.
6. `cd performance && npm ci && npm start` then `npm run test:perf` — all thresholds pass.
7. Open the latest CI run `38359351107` and confirm the setup error in the Playwright job log.
8. Confirm no test/page/fixture/API/workflow file appears in the WP0 diff.
