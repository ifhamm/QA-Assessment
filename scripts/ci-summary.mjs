#!/usr/bin/env node
/**
 * WP7: builds the GitHub Actions job summary and evaluates the written quality
 * gate policy.
 *
 * Inputs are the merged Playwright JSON report, the Newman JSON report, and
 * optionally the per-stage Playwright JSON reports (used only to attribute a
 * failure to a stage). Nothing here talks to the network; links are built from
 * the standard GitHub Actions environment variables.
 *
 * Local check:
 *   node scripts/ci-summary.mjs --playwright merged.json --newman newman.json
 *
 * Exit code is 0 when the gates pass and 1 when they do not.
 */
import fs from "node:fs";
import path from "node:path";

const ANSI = /\u001b\[[0-9;]*m/g;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) throw new Error(`Unexpected argument: ${key}`);
    const value = argv[i + 1];
    if (value === undefined) throw new Error(`Missing value for ${key}`);
    args[key.slice(2)] = value;
    i += 1;
  }
  return args;
}

function readJson(file) {
  if (!file || !fs.existsSync(file)) return null;
  return JSON.parse(
    fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""),
  );
}

function collectSpecs(suites, out = []) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) out.push({ spec, suite });
    collectSpecs(suite.suites, out);
  }
  return out;
}

function repoPath(file, rootDir) {
  if (!file) return "(unknown)";
  const absolute = path.isAbsolute(file)
    ? file
    : path.resolve(rootDir ?? process.cwd(), file);
  const relative = path.relative(process.cwd(), absolute);
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
    return relative.split(path.sep).join("/");
  }
  // The merged report keeps whichever rootDir the last blob used; the visual
  // container records `/work/tests`, so host paths can fail the relative
  // check. testDir is always ./tests, so restore that prefix for display.
  const fallback = file.split(path.sep).join("/").replace(/^\.\//, "");
  if (path.isAbsolute(file) || fallback.startsWith("tests/")) return fallback;
  return `tests/${fallback}`;
}

function firstLine(value) {
  const clean = String(value ?? "").replace(ANSI, "").replace(/\r/g, "").trim();
  const line = clean
    .split("\n")
    .map((part) => part.trim())
    .find(Boolean);
  return (line ?? "").slice(0, 200);
}

function playwrightEntries(data) {
  if (!data) return [];
  const rootDir = data.config?.rootDir;
  const entries = [];
  for (const { spec, suite } of collectSpecs(data.suites)) {
    for (const test of spec.tests ?? []) {
      const results = test.results ?? [];
      const last = results[results.length - 1];
      // For a flaky test the last attempt passed, so report the first failure
      // instead of an empty error cell.
      const firstFailed = results.find((result) => result.status === "failed");
      entries.push({
        id: spec.id,
        title: spec.title,
        file: repoPath(spec.file ?? suite.file, rootDir),
        line: spec.line ?? suite.line ?? 0,
        project: test.projectName || "default",
        status: test.status,
        attempts: results.length,
        error: firstLine(
          (firstFailed ?? last)?.error?.message ??
            (firstFailed ?? last)?.errors?.[0]?.message,
        ),
        trace: results.some((result) =>
          (result.attachments ?? []).some((attachment) =>
            /trace/i.test(attachment.name ?? ""),
          ),
        ),
      });
    }
  }
  return entries;
}

function countStatuses(entries) {
  const counts = { passed: 0, failed: 0, flaky: 0, skipped: 0 };
  for (const entry of entries) {
    if (entry.status === "expected") counts.passed += 1;
    else if (entry.status === "unexpected") counts.failed += 1;
    else if (entry.status === "flaky") counts.flaky += 1;
    else if (entry.status === "skipped") counts.skipped += 1;
  }
  return counts;
}

function* walkJson(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkJson(full);
    else if (entry.name.endsWith(".json")) yield full;
  }
}

/** spec id -> stage label ("smoke", "regression-1", "visual"). */
function stageLookup(dir) {
  const stages = new Map();
  if (!dir || !fs.existsSync(dir)) return stages;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const stage = entry.name.replace(/^results-/, "");
    for (const file of walkJson(path.join(dir, entry.name))) {
      const data = readJson(file);
      for (const { spec } of collectSpecs(data?.suites)) {
        if (spec.id) stages.set(spec.id, stage);
      }
    }
  }
  return stages;
}

function newmanReport(data) {
  if (!data) return null;
  const stats = data.run?.stats;
  const failures = (data.run?.failures ?? []).map((failure) => ({
    name: failure.source?.name ?? "request",
    error: firstLine(failure.error?.message ?? failure.error?.test),
  }));
  return {
    requests: stats?.requests ?? null,
    assertions: stats?.assertions ?? null,
    failures,
  };
}

function escapeCell(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

function buildMarkdown({
  entries,
  counts,
  gates,
  gateFailures,
  newman,
  stageById,
  runUrl,
}) {
  const lines = [];
  const verdict =
    gateFailures.length === 0 && counts.failed === 0 && counts.flaky === 0
      ? "✅ pass"
      : gateFailures.length === 0
        ? "⚠️ pass with warnings"
        : "❌ blocked";
  lines.push("## QA summary", "");
  lines.push(`**Verdict:** ${verdict}`, "");

  lines.push("| Metric | Count |", "| --- | ---: |");
  lines.push(`| Passed | ${counts.passed} |`);
  lines.push(`| Failed | ${counts.failed} |`);
  lines.push(`| Flaky (passed on retry) | ${counts.flaky} |`);
  lines.push(`| Skipped | ${counts.skipped} |`);
  lines.push("");

  if (Object.keys(gates).length > 0) {
    lines.push("### Stage results", "");
    lines.push("| Stage | Result |", "| --- | --- |");
    for (const [stage, result] of Object.entries(gates)) {
      lines.push(`| ${escapeCell(stage)} | ${escapeCell(result)} |`);
    }
    lines.push("");
  }

  if (gateFailures.length > 0) {
    lines.push("### Gate failures", "");
    for (const failure of gateFailures) lines.push(`- ${failure}`);
    lines.push("");
  }

  const failures = entries.filter((entry) => entry.status === "unexpected");
  if (failures.length > 0) {
    lines.push("### Failures", "");
    lines.push(
      "| Test | Location | Project | Stage | Attempts | Trace | First error |",
      "| --- | --- | --- | --- | ---: | --- | --- |",
    );
    for (const entry of failures.slice(0, 25)) {
      lines.push(
        `| ${escapeCell(entry.title)} | \`${escapeCell(entry.file)}:${entry.line}\` | ` +
          `${escapeCell(entry.project)} | ${escapeCell(stageById.get(entry.id) ?? "host")} | ` +
          `${entry.attempts} | ${entry.trace ? "yes" : "no"} | ${escapeCell(entry.error)} |`,
      );
    }
    if (failures.length > 25) {
      lines.push("", `_${failures.length - 25} more failure(s) in the merged report._`);
    }
    lines.push("");
  }

  const flaky = entries.filter((entry) => entry.status === "flaky");
  if (flaky.length > 0) {
    lines.push("### Flaky — passed only on retry", "");
    lines.push(
      "| Test | Location | Project | Stage | Attempts | First error |",
      "| --- | --- | --- | --- | ---: | --- |",
    );
    for (const entry of flaky.slice(0, 25)) {
      lines.push(
        `| ${escapeCell(entry.title)} | \`${escapeCell(entry.file)}:${entry.line}\` | ` +
          `${escapeCell(entry.project)} | ${escapeCell(stageById.get(entry.id) ?? "host")} | ` +
          `${entry.attempts} | ${escapeCell(entry.error)} |`,
      );
    }
    lines.push("", "_Flaky tests stay visible; retries do not turn them green silently._", "");
  }

  if (newman) {
    lines.push("### API (Newman)", "");
    if (newman.requests) {
      lines.push(
        `Requests: **${newman.requests.total}** (${newman.requests.failed} failed) · ` +
          `Assertions: **${newman.assertions?.total ?? 0}** (${newman.assertions?.failed ?? 0} failed)`,
        "",
      );
    }
    if (newman.failures.length > 0) {
      lines.push("| Request | First error |", "| --- | --- |");
      for (const failure of newman.failures.slice(0, 10)) {
        lines.push(`| ${escapeCell(failure.name)} | ${escapeCell(failure.error)} |`);
      }
      lines.push("");
    }
  }

  lines.push("### Where to look", "");
  if (runUrl) lines.push(`- Run: ${runUrl}`);
  lines.push(
    "- `merged-report`: HTML report for every stage, with embedded traces and screenshots.",
    "- `merged-results`: merged JSON + JUnit for external consumers.",
    "- `results-*` and `api-results`: per-stage JSON/JUnit/Newman reports.",
    "- A failed test's trace is one click from the merged report; the report itself is one artifact download away.",
    "",
  );
  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const playwrightFile = args.playwright ?? "test-results/merged.json";
  const newmanFile = args.newman ?? "test-results/newman.json";
  const outFile = args.out ?? "summary.md";

  const playwrightData = readJson(playwrightFile);
  const entries = playwrightEntries(playwrightData);
  const counts = countStatuses(entries);
  const newman = newmanReport(readJson(newmanFile));
  const stageById = stageLookup(args["stages-dir"]);

  const gates = args.gates
    ? Object.fromEntries(
        args.gates
          .split(",")
          .map((pair) => pair.trim())
          .filter(Boolean)
          .map((pair) => {
            const index = pair.indexOf("=");
            return [pair.slice(0, index), pair.slice(index + 1)];
          }),
      )
    : {};

  const gateFailures = [];
  for (const [stage, result] of Object.entries(gates)) {
    if (result !== "success") {
      gateFailures.push(`Stage \`${stage}\` finished as \`${result}\`.`);
    }
  }
  if (!playwrightData) {
    gateFailures.push(
      `Merged Playwright report not found at \`${playwrightFile}\`; the merged report job did not produce results.`,
    );
  } else if (counts.failed > 0) {
    gateFailures.push(
      `${counts.failed} test(s) failed. Failures block the gate; flaky tests only warn.`,
    );
  }
  if (!newman) {
    gateFailures.push(
      `Newman report not found at \`${newmanFile}\`; API results are missing.`,
    );
  } else if ((newman.requests?.failed ?? 0) > 0) {
    gateFailures.push(
      `Newman reported ${newman.requests.failed} failed request(s).`,
    );
  }

  const server = process.env.GITHUB_SERVER_URL ?? "https://github.com";
  const repository = process.env.GITHUB_REPOSITORY ?? "";
  const runId = process.env.GITHUB_RUN_ID ?? "";
  const runUrl =
    repository && runId ? `${server}/${repository}/actions/runs/${runId}` : "";

  const markdown = buildMarkdown({
    entries,
    counts,
    gates,
    gateFailures,
    newman,
    stageById,
    runUrl,
  });

  fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
  fs.writeFileSync(outFile, `${markdown}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
  }
  process.stdout.write(`${markdown}\n`);

  if (counts.flaky > 0) {
    process.stdout.write(
      `::warning title=Flaky tests::${counts.flaky} test(s) passed only on retry and must be investigated.\n`,
    );
  }
  for (const failure of gateFailures) {
    process.stdout.write(`::error title=Quality gate::${failure}\n`);
  }
  process.exitCode = gateFailures.length === 0 ? 0 : 1;
}

main();
