import fs from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import type { TestSuiteRunResult } from "./types.js";

export class TestSuiteReportWriter {
  constructor(private readonly outputDir: string) {}

  async write(result: TestSuiteRunResult): Promise<{
    latestJsonPath: string;
    latestMarkdownPath: string;
    historyMarkdownPath: string;
  }> {
    const historyDir = path.join(this.outputDir, "history");

    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(historyDir, { recursive: true });

    const latestJsonPath = path.join(this.outputDir, "latest-suite-report.json");
    const latestMarkdownPath = path.join(this.outputDir, "latest-suite-report.md");
    const historyMarkdownPath = path.join(
      historyDir,
      `${dayjs(result.startedAt).format("YYYY-MM-DD-HHmmss")}-suite-report.md`
    );

    const markdown = this.toMarkdown(result);

    await fs.writeFile(latestJsonPath, JSON.stringify(result, null, 2), "utf-8");
    await fs.writeFile(latestMarkdownPath, markdown, "utf-8");
    await fs.writeFile(historyMarkdownPath, markdown, "utf-8");

    return {
      latestJsonPath,
      latestMarkdownPath,
      historyMarkdownPath
    };
  }

  private toMarkdown(result: TestSuiteRunResult): string {
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

    lines.push("## Tasks");
    lines.push("");
    lines.push("| Task | Type | Status | Duration | Message |");
    lines.push("|---|---|---|---:|---|");

    for (const task of result.tasks) {
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
}

function escapeMd(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
