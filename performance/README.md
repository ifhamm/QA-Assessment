# Beginner-Friendly API & k6 Performance Test

This is a simple Node.js and Express API, along with a k6 performance test script. This project is meant to be a beginner-friendly introduction to load testing APIs.

## Project Structure

- `app/server.js`: The Express API server with in-memory product data.
- `k6/products-performance.js`: The k6 performance test script.
- `package.json`: Project dependencies and scripts.

## Getting Started

**Prerequisite:** You must install the [k6 binary](https://k6.io/docs/get-started/installation/) on your machine before running these tests. k6 is not a standard npm dependency that gets installed via `npm install` in this project.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the API:
   ```bash
   npm start
   ```
3. In a separate terminal, run the k6 performance test:
   ```bash
   npm run test:perf
   ```

## k6 Concepts Explained

Here are some important concepts used in our k6 test script:

- **VU (Virtual User)**: A virtual user simulates a real user interacting with your API. k6 spins up multiple VUs to test how your API handles concurrent requests.
- **Iteration**: A single complete run of the `default function()` in your k6 script by one VU. In our script, an iteration consists of fetching the products list, fetching a single product, and then waiting.
- **Why 5 VUs?**: We intentionally use a very low number of VUs (5) because this is a baseline test to ensure the API works functionally under very mild load, without overwhelming our local machine or requiring complex tuning.
- **p95 (95th Percentile)**: This metric means that 95% of the requests were completed in less than or equal to this time. It's a much better indicator of typical user experience than the average (mean) because it ignores extreme outliers. If p95 is 500ms, 95% of users experienced a response time of 500ms or faster.
- **`http_req_failed < 1%`**: This threshold dictates that the test will fail if more than 1% of the total HTTP requests result in an error (like a 404 or 500 status code). 
- **Check vs. Threshold**: 
  - A **`check()`** is like an assertion (e.g., "Is the status 200?"). It does not fail the entire test if it's false; it just records a boolean result for your report. We use it here for lightweight functional correctness.
  - A **`threshold`** sets a pass/fail criteria for the whole test execution (e.g., "If the error rate is above 1%, fail the test").
- **Why `sleep(1)`?**: Real users don't spam endpoints instantly. After getting a response, a user typically thinks, reads, or moves the mouse before clicking the next thing. `sleep(1)` adds a 1-second pause at the end of each iteration to simulate this "think time."
- **Endpoint Tags**: We tag our requests (e.g., `tags: { type: 'products_list' }`). This allows us to group metrics by endpoint. Instead of just seeing the global API response time, tags let us see that fetching the list took X ms while fetching a single product took Y ms, making it easy to compare and find bottlenecks.

## Future Improvements
  
These are some ideas to expand this into a more robust portfolio project later on:
- pagination/filtering
- POST endpoint and test-data lifecycle
- authenticated multi-user testing
- arrival-rate executor
- stress testing
- custom k6 metrics
- CI performance smoke test
