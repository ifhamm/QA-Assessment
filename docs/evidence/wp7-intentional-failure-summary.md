## QA summary

**Verdict:** ❌ blocked

| Metric | Count |
| --- | ---: |
| Passed | 9 |
| Failed | 1 |
| Flaky (passed on retry) | 0 |
| Skipped | 0 |

### Stage results

| Stage | Result |
| --- | --- |
| static | success |
| api | success |
| smoke | failure |
| regression | success |
| visual | success |
| report | success |

### Gate failures

- Stage `smoke` finished as `failure`.
- 1 test(s) failed. Failures block the gate; flaky tests only warn.

### Failures

| Test | Location | Project | Stage | Attempts | Trace | First error |
| --- | --- | --- | --- | ---: | --- | --- |
| wp7 intentional failure probe @smoke | `tests/ui/wp7-intentional-failure.spec.ts:6` | chromium | smoke | 2 | yes | Error: expect(received).toBe(expected) // Object.is equality |

### API (Newman)

Requests: **15** (0 failed) · Assertions: **53** (0 failed)

### Where to look

- Run: https://github.com/ifhamm/QA-Assessment/actions/runs/43553098095
- `merged-report`: HTML report for every stage, with embedded traces and screenshots.
- `merged-results`: merged JSON + JUnit for external consumers.
- `results-*` and `api-results`: per-stage JSON/JUnit/Newman reports.
- A failed test's trace is one click from the merged report; the report itself is one artifact download away.

