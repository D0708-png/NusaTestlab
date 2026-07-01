import fs from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import type { TestSuiteRunResult } from "./types.js";

export class TestSuiteReportWriter {
  constructor(private readonly outputDir: string) {}

  async write(result: TestSuiteRunResult, options: { failuresOnly?: boolean } = {}): Promise<{
    latestJsonPath: string;
    latestMarkdownPath: string;
    latestXmlPath: string;
    historyMarkdownPath: string;
  }> {
    const historyDir = path.join(this.outputDir, "history");

    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(historyDir, { recursive: true });

    const latestJsonPath = path.join(this.outputDir, "latest-suite-report.json");
    const latestMarkdownPath = path.join(this.outputDir, "latest-suite-report.md");
    const latestXmlPath = path.join(this.outputDir, "latest-suite-report.xml");
    const historyMarkdownPath = path.join(
      historyDir,
      `${dayjs(result.startedAt).format("YYYY-MM-DD-HHmmss")}-suite-report.md`
    );

    const markdown = this.toMarkdown(result, options);
    const xml = this.toJUnitXml(result);

    await fs.writeFile(latestJsonPath, JSON.stringify(result, null, 2), "utf-8");
    await fs.writeFile(latestMarkdownPath, markdown, "utf-8");
    await fs.writeFile(latestXmlPath, xml, "utf-8");
    await fs.writeFile(historyMarkdownPath, markdown, "utf-8");

    return {
      latestJsonPath,
      latestMarkdownPath,
      latestXmlPath,
      historyMarkdownPath
    };
  }

  private toMarkdown(result: TestSuiteRunResult, options: { failuresOnly?: boolean } = {}): string {
    const lines: string[] = [];

    lines.push("# NusaTestLab Test Suite Report");
    lines.push("");
    lines.push(`Suite: \`${result.suiteName}\``);
    lines.push(`Suite ID: \`${result.suiteId}\``);
    lines.push(`Profile: \`${result.profile}\``);
    lines.push(`Mode: \`${result.mode}\``);
    lines.push(`Status: \`${result.status}\``);
    lines.push(`Started At: \`${result.startedAt}\``);
    lines.push(`Completed At: \`${result.completedAt}\``);
    lines.push(`Duration: ${result.durationMs}ms`);
    lines.push("");

    lines.push("## Summary");
    lines.push("");
    lines.push(`- Total: ${result.summary.total}`);
    lines.push(`- Passed: ${result.summary.passed}`);
    lines.push(`- Failed: ${result.summary.failed}`);
    lines.push(`- Skipped: ${result.summary.skipped}`);
    lines.push("");

    lines.push(options.failuresOnly ? "## Failures Only" : "## Tasks");
    lines.push("");
    lines.push("| Task | Type | Status | Duration | Message |");
    lines.push("|---|---|---|---:|---|");

    const visibleTasks = options.failuresOnly ? result.tasks.filter((task) => task.status !== "passed") : result.tasks;
    for (const task of visibleTasks) {
      lines.push(
        `| ${escapeMd(task.id)} | ${escapeMd(task.type)} | ${escapeMd(task.status)} | ${task.durationMs}ms | ${escapeMd(task.message)} |`
      );
    }

    const failedTasks = result.tasks.filter((task) => task.status === "failed");

    if (failedTasks.length > 0) {
      lines.push("");
      lines.push("## Failures");
      lines.push("");

      for (const task of failedTasks) {
        lines.push(`### ${task.id}`);
        lines.push("");
        lines.push("```txt");
        lines.push(task.error ?? "No error details.");
        lines.push("```");
        lines.push("");
      }
    }

    return `${lines.join("\n")}\n`;
  }

  private toJUnitXml(result: TestSuiteRunResult): string {
    const testCases = result.tasks.map((task) => {
      const timeSeconds = (task.durationMs / 1000).toFixed(3);
      const className = `${result.suiteId}.${task.type}`;
      const name = task.id;

      if (task.status === "failed") {
        return [
          `    <testcase classname="${escapeXml(className)}" name="${escapeXml(name)}" time="${timeSeconds}">`,
          `      <failure message="${escapeXml(task.message)}">${escapeXml(task.error ?? task.message)}</failure>`,
          "    </testcase>"
        ].join("\n");
      }

      if (task.status === "skipped") {
        return [
          `    <testcase classname="${escapeXml(className)}" name="${escapeXml(name)}" time="${timeSeconds}">`,
          `      <skipped message="${escapeXml(task.message)}" />`,
          "    </testcase>"
        ].join("\n");
      }

      return `    <testcase classname="${escapeXml(className)}" name="${escapeXml(name)}" time="${timeSeconds}" />`;
    });

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<testsuites tests="${result.summary.total}" failures="${result.summary.failed}" skipped="${result.summary.skipped}" time="${(result.durationMs / 1000).toFixed(3)}">`,
      `  <testsuite name="${escapeXml(result.suiteName)}" tests="${result.summary.total}" failures="${result.summary.failed}" skipped="${result.summary.skipped}" time="${(result.durationMs / 1000).toFixed(3)}" timestamp="${escapeXml(result.startedAt)}">`,
      ...testCases,
      "  </testsuite>",
      "</testsuites>",
      ""
    ].join("\n");
  }
}

function escapeMd(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

