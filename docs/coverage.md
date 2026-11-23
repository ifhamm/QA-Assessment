# Test Coverage Matrix

This matrix maps user-visible risk areas to the automated level that proves
the behavior. It complements, rather than replaces, the generated
`coverage-report/coverage-report.md` inventory.

| Risk area | Scenario | Automated level | Status |
| --- | --- | --- | --- |
| Authentication | UI login, invalid credentials, logout, invalid stored token | UI Playwright | Covered |
| Registration | Form gating and duplicate-registration contract | Playwright + Newman | Covered |
| Article creation | UI and API creation, cross-layer verification | Playwright + Newman | Covered |
| Article update | UI update reflected in API | Cross-layer Playwright | Covered |
| Article deletion | UI deletion plus API verification | Playwright + Newman | Covered |
| Authorization | Protected route, malformed token, unauthorized update | Playwright + Newman | Covered |
| Validation | Empty article and malformed API inputs | Playwright + Newman | Covered |
| Rendering | Login and authenticated editor baselines | Playwright visual | Covered |
| Cross-browser | Smoke flows on Chromium, Firefox, and WebKit | Playwright projects | Covered |
| Performance | Low-load product list/detail thresholds | k6 | Optional / not in CI |

## Current inventory

| Area | Count |
| --- | ---: |
| Playwright host definitions | 12, including setup |
| Playwright visual definitions | 2 |
| Playwright smoke / regression definitions | 3 / 8 |
| Newman requests | 18 |
| Newman assertions | 63 |

Generate the machine-readable inventory with:

```bash
npm run coverage:report
```
