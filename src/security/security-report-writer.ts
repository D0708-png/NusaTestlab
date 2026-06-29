import fs from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import type { SecurityRunResult } from "./types.js";

export class SecurityReportWriter {
  constructor(private readonly outputDir: string) {}

  async write(result: SecurityRunResult): Promise<{
    latestJsonPath: string;
    latestMarkdownPath: string;
    historyMarkdownPath: string;
  }> {
    const historyDir = path.join(this.outputDir, "history");

    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(historyDir, { recursive: true });

    const latestJsonPath = path.join(this.outputDir, "latest-security-report.json");
    const latestMarkdownPath = path.join(this.outputDir, "latest-security-report.md");
    const historyMarkdownPath = path.join(
      historyDir,
      `${dayjs(result.startedAt).format("YYYY-MM-DD-HHmmss")}-${result.runId}-security.md`
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

  private toMarkdown(result: SecurityRunResult): string {
    const lines: string[] = [];

    lines.push("# NusaTestLab Security Report");
    lines.push("");
    lines.push(`Run ID: \`${result.runId}\``);
    lines.push(`Target App: \`${result.target.appName}\``);
    lines.push(`Profile: \`${result.target.profileName}\``);
    lines.push(`Mode: \`${result.mode}\``);
    lines.push(`API Base URL: \`${result.target.apiBaseUrl}\``);
    lines.push(`Started At: \`${result.startedAt}\``);
    lines.push(`Completed At: \`${result.completedAt}\``);
    lines.push("");

    lines.push("## Summary");
    lines.push("");
    lines.push(`- Total: ${result.summary.total}`);
    lines.push(`- Passed: ${result.summary.passed}`);
    lines.push(`- Failed: ${result.summary.failed}`);
    lines.push(`- Warning: ${result.summary.warning}`);
    lines.push(`- Skipped: ${result.summary.skipped}`);
    lines.push("");

    lines.push("## Scenarios");
    lines.push("");
    lines.push("| Scenario | Severity | Method | Path | Role | Expected | Actual | Status |");
    lines.push("|---|---|---|---|---|---:|---:|---|");

    for (const scenario of result.scenarios) {
      lines.push(
        `| ${escapeMd(scenario.name)} | ${scenario.severity} | ${scenario.method} | ${escapeMd(
          scenario.path
        )} | ${scenario.role} | ${scenario.expectedStatus} | ${
          scenario.actualStatus ?? "-"
        } | ${scenario.status} |`
      );
    }

    const failed = result.scenarios.filter((scenario) => scenario.status === "failed");

    if (failed.length > 0) {
      lines.push("");
      lines.push("## Failed Details");
      lines.push("");

      for (const scenario of failed) {
        lines.push(`### ${scenario.name}`);
        lines.push("");
        lines.push(`- Path: \`${scenario.method} ${scenario.path}\``);
        lines.push(`- Role: \`${scenario.role}\``);
        lines.push(`- Expected: \`${scenario.expectedStatus}\``);
        lines.push(`- Actual: \`${scenario.actualStatus ?? "-"}\``);
        lines.push(`- Message: ${scenario.message ?? "-"}`);
        lines.push(`- Error: ${scenario.error ?? "-"}`);
        lines.push("");
      }
    }

    return `${lines.join("\n")}\n`;
  }
}

function escapeMd(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
