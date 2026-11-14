## QA summary

**Verdict:** ✅ pass

| Metric | Count |
| --- | ---: |
| Passed | 9 |
| Failed | 0 |
| Flaky (passed on retry) | 0 |
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

### API (Newman)

Requests: **15** (0 failed) · Assertions: **53** (0 failed)

### Where to look

- Run: https://github.com/ifhamm/QA-Assessment/actions/runs/43552638345
- `merged-report`: HTML report for every stage, with embedded traces and screenshots.
- `merged-results`: merged JSON + JUnit for external consumers.
- `results-*` and `api-results`: per-stage JSON/JUnit/Newman reports.
- A failed test's trace is one click from the merged report; the report itself is one artifact download away.

