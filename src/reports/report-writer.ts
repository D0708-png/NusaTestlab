import fs from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import type { TestRunResult } from "../core/types.js";

interface ReportWriterResult {
  latestJsonPath: string;
  latestMarkdownPath: string;
  historyMarkdownPath: string;
}

export class ReportWriter {
  constructor(private readonly outputDir: string) {}

  async write(result: TestRunResult): Promise<ReportWriterResult> {
    const historyDir = path.join(this.outputDir, "history");

    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(historyDir, { recursive: true });

    const latestJsonPath = path.join(this.outputDir, "latest-report.json");
    const latestMarkdownPath = path.join(this.outputDir, "latest-report.md");
    const historyMarkdownPath = path.join(
      historyDir,
      `${dayjs(result.startedAt).format("YYYY-MM-DD-HHmmss")}-${result.runId}.md`
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

  private toMarkdown(result: TestRunResult): string {
    const lines: string[] = [];

    lines.push(`# NusaTestLab Report`);
    lines.push("");
    lines.push(`Run ID: \`${result.runId}\``);
    lines.push(`Target App: \`${result.target.appName}\``);
    lines.push(`Profile: \`${result.profileName}\``);
    lines.push(`API Base URL: \`${result.target.apiBaseUrl}\``);
    lines.push(`Started At: \`${result.startedAt}\``);
    lines.push(`Completed At: \`${result.completedAt}\``);
    lines.push(`Duration: \`${result.durationMs}ms\``);
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
    lines.push("| Scenario | Module | Severity | Status | Duration |");
    lines.push("|---|---|---|---|---|");

    for (const scenario of result.scenarios) {
      lines.push(
        `| ${this.escape(scenario.name)} | ${this.escape(scenario.module)} | ${
          scenario.severity
        } | ${scenario.status} | ${scenario.durationMs}ms |`
      );
    }

    const failedScenarios = result.scenarios.filter((scenario) => scenario.status === "failed");

    if (failedScenarios.length > 0) {
      lines.push("");
      lines.push("## Failed Details");
      lines.push("");

      for (const scenario of failedScenarios) {
        lines.push(`### ${scenario.name}`);
        lines.push("");
        lines.push("| Step | Operator | Expected | Actual | Error |");
        lines.push("|---|---|---|---|---|");

        for (const step of scenario.steps.filter((item) => item.status === "failed")) {
          lines.push(
            `| ${this.escape(step.name)} | ${step.operator ?? "-"} | ${this.escape(
              this.stringify(step.expected)
            )} | ${this.escape(this.stringify(step.actual))} | ${this.escape(
              step.error ?? "-"
            )} |`
          );
        }

        lines.push("");
      }
    }

    return `${lines.join("\n")}\n`;
  }

  private stringify(value: unknown): string {
    if (value === undefined) {
      return "undefined";
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  private escape(value: string): string {
    return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
  }
}
