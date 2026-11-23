#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "coverage-report");
fs.mkdirSync(outDir, { recursive: true });

function walk(dir, extension, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, extension, out);
    else if (entry.name.endsWith(extension)) out.push(full);
  }
  return out;
}

function countPlaywrightTests(file) {
  const source = fs.readFileSync(file, "utf8");
  const titles = [...source.matchAll(/\btest(?:\.skip)?(?:\.fixme)?\(\s*["'`]([^"'`]+)["'`]/g)]
    .map((match) => match[1])
    .filter((title) => !title.toLowerCase().includes("wp7 "));
  const tags = titles.filter((title) => title.includes("@smoke")).length;
  const regression = titles.filter((title) => title.includes("@regression")).length;
  return {
    file: path.relative(root, file).split(path.sep).join("/"),
    tests: titles.length,
    smoke: tags,
    regression,
  };
}

function flattenItems(items, out = []) {
  for (const item of items ?? []) {
    if (item.request) out.push(item);
    flattenItems(item.item, out);
  }
  return out;
}

const specFiles = walk(path.join(root, "tests"), ".spec.ts");
const specInventory = specFiles
  .filter((file) => !file.includes(`${path.sep}visual${path.sep}`))
  .map(countPlaywrightTests);

const visualFiles = walk(path.join(root, "tests"), ".spec.ts")
  .filter((file) => file.includes(`${path.sep}visual${path.sep}`))
  .map(countPlaywrightTests);

const collection = JSON.parse(
  fs.readFileSync(path.join(root, "postman/conduit.postman_collection.json"), "utf8"),
);
const apiItems = flattenItems(collection.item);
let apiAssertions = 0;
for (const item of apiItems) {
  const raw = JSON.stringify(item);
  apiAssertions += (raw.match(/pm\.test\s*\(/g) ?? []).length;
}

const inventory = {
  playwright: {
    hostTestDefinitions: specInventory.reduce((sum, item) => sum + item.tests, 0),
    visualTestDefinitions: visualFiles.reduce((sum, item) => sum + item.tests, 0),
    smokeDefinitions: specInventory.reduce((sum, item) => sum + item.smoke, 0),
    regressionDefinitions: specInventory.reduce((sum, item) => sum + item.regression, 0),
    files: [...specInventory, ...visualFiles],
  },
  newman: {
    requests: apiItems.length,
    assertions: apiAssertions,
  },
};

const matrix = [
  ["Authentication", "UI login; invalid credentials; logout; invalid stored token", "UI Playwright", "Covered"],
  ["Registration", "Form gating and duplicate-registration contract", "Playwright + Newman", "Covered"],
  ["Article creation", "UI and API create; cross-layer verification", "Playwright + Newman", "Covered"],
  ["Article update", "UI update reflected in API", "Cross-layer Playwright", "Covered"],
  ["Article deletion", "UI delete plus API verification", "Playwright + Newman", "Covered"],
  ["Authorization", "Protected route, malformed token, unauthorized update", "Playwright + Newman", "Covered"],
  ["Validation", "Empty article and malformed API inputs", "Playwright + Newman", "Covered"],
  ["Rendering", "Login and editor visual baselines", "Playwright visual", "Covered"],
  ["Cross-browser", "Smoke flows on Firefox and WebKit", "Playwright matrix", "Covered"],
  ["Performance", "Low-load product list/detail thresholds", "k6", "Optional / not in CI"],
];

const lines = [
  "# Automated Coverage Report",
  "",
  "Generated from the Playwright specification files and Postman collection.",
  "This is a traceability inventory, not a claim of source-code branch coverage.",
  "",
  "## Counts",
  "",
  "| Area | Count |",
  "| --- | ---: |",
  `| Playwright host definitions | ${inventory.playwright.hostTestDefinitions} |`,
  `| Playwright visual definitions | ${inventory.playwright.visualTestDefinitions} |`,
  `| Playwright setup definitions | 1 |`,
  `| Smoke definitions | ${inventory.playwright.smokeDefinitions} |`,
  `| Regression definitions | ${inventory.playwright.regressionDefinitions} |`,
  `| Newman requests | ${inventory.newman.requests} |`,
  `| Newman pm.test assertions | ${inventory.newman.assertions} |`,
  "",
  "## Risk coverage matrix",
  "",
  "| Risk area | Scenario | Automated level | Status |",
  "| --- | --- | --- | --- |",
  ...matrix.map((row) => `| ${row.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`),
  "",
  "## Playwright inventory",
  "",
  "| File | Host tests | Smoke | Regression |",
  "| --- | ---: | ---: | ---: |",
];

for (const item of inventory.playwright.files) {
  lines.push(`| \`${item.file}\` | ${item.tests} | ${item.smoke} | ${item.regression} |`);
}

lines.push("", "## CI interpretation", "");
lines.push("- API, UI, cross-layer, visual, and browser-smoke suites run in GitHub Actions.");
lines.push("- k6 remains an optional local performance suite and is not included in the merge quality gate.");
lines.push("- Missing reports block the CI quality gate; coverage this matrix describes behavior, not executed source lines.");

fs.writeFileSync(path.join(outDir, "coverage-report.md"), `${lines.join("\n")}\n`);
fs.writeFileSync(path.join(outDir, "coverage-report.json"), `${JSON.stringify(inventory, null, 2)}\n`);
