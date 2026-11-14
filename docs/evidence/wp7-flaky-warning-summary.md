## QA summary

**Verdict:** ⚠️ pass with warnings

| Metric | Count |
| --- | ---: |
| Passed | 9 |
| Failed | 0 |
| Flaky (passed on retry) | 1 |
| Skipped | 0 |

### Stage results

| Stage | Result |
| --- | --- |
| static | success |
| api | success |
| smoke | success |
| regression | success |
| visual | success |
| report | success |

### Flaky — passed only on retry

| Test | Location | Project | Stage | Attempts | First error |
| --- | --- | --- | --- | ---: | --- |
| wp7 flaky probe @regression | `tests/ui/wp7-flaky-probe.spec.ts:5` | chromium | regression-1 | 2 | Error: expect(received).toBeGreaterThan(expected) |

_Flaky tests stay visible; retries do not turn them green silently._

### API (Newman)

Requests: **15** (0 failed) · Assertions: **53** (0 failed)

### Where to look

- Run: https://github.com/ifhamm/QA-Assessment/actions/runs/43553398227
- `merged-report`: HTML report for every stage, with embedded traces and screenshots.
- `merged-results`: merged JSON + JUnit for external consumers.
- `results-*` and `api-results`: per-stage JSON/JUnit/Newman reports.
- A failed test's trace is one click from the merged report; the report itself is one artifact download away.

