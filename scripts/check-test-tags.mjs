// Fails when a host test lacks exactly one of @smoke / @regression, or when a
// visual test carries a stage tag it should not have. Run in the static CI
// stage so tag drift is caught before a shard silently runs the wrong tests.
import { execFileSync } from "node:child_process";

const cli = "node_modules/@playwright/test/cli.js";
const output = execFileSync(process.execPath, [cli, "test", "--list"], {
  encoding: "utf8",
  env: { ...process.env, FORCE_COLOR: "0" },
});

const linePattern = /^\s*\[(?<project>[^\]]+)\] › .+:\d+:\d+ › (?<title>.+)$/;
const tests = output
  .split(/\r?\n/)
  .map((line) => line.match(linePattern))
  .filter(Boolean)
  .map((match) => match.groups);

const problems = [];
let smoke = 0;
let regression = 0;

for (const test of tests) {
  const isSmoke = test.title.includes("@smoke");
  const isRegression = test.title.includes("@regression");
  const tags = Number(isSmoke) + Number(isRegression);

  if (test.project === "setup") {
    if (tags > 0) problems.push(`setup test must stay untagged: ${test.title}`);
    continue;
  }

  if (test.project === "visual") {
    if (tags > 0) {
      problems.push(`visual test must stay out of stage tags: ${test.title}`);
    }
    continue;
  }

  if (tags !== 1) {
    problems.push(
      `host test needs exactly one of @smoke/@regression: [${test.project}] ${test.title}`
    );
  }
  if (isSmoke) smoke += 1;
  if (isRegression) regression += 1;
}

if (smoke === 0) problems.push("no @smoke tests found");
if (regression === 0) problems.push("no @regression tests found");

if (problems.length > 0) {
  console.error("Test tag check failed:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `Test tags OK: ${smoke} @smoke, ${regression} @regression, ` +
    `${tests.filter((test) => test.project === "visual").length} visual`
);
