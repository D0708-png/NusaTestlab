import fs from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import type { AiRunResult } from "./types.js";

export class AiReportWriter {
  constructor(private readonly outputDir: string) {}

  async write(result: AiRunResult): Promise<{
    latestJsonPath: string;
    latestMarkdownPath: string;
    historyMarkdownPath: string;
  }> {
    const historyDir = path.join(this.outputDir, "history");

    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(historyDir, { recursive: true });

    const latestJsonPath = path.join(this.outputDir, "latest-ai-report.json");
    const latestMarkdownPath = path.join(this.outputDir, "latest-ai-report.md");
    const historyMarkdownPath = path.join(
      historyDir,
      `${dayjs(result.startedAt).format("YYYY-MM-DD-HHmmss")}-${result.runId}-ai.md`
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

  private toMarkdown(result: AiRunResult): string {
    const lines: string[] = [];

    lines.push("# NusaTestLab AI Testing Report");
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
    lines.push("| Scenario | Severity | Role | Endpoint | Status |");
    lines.push("|---|---|---|---|---|");

    for (const scenario of result.scenarios) {
      lines.push(
        `| ${escapeMd(scenario.name)} | ${scenario.severity} | ${scenario.role} | ${escapeMd(
          scenario.endpointPath
        )} | ${scenario.status} |`
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
        lines.push(`- Endpoint: \`${scenario.endpointPath}\``);
        lines.push(`- Role: \`${scenario.role}\``);
        lines.push(`- Prompt: ${escapeMd(scenario.prompt)}`);
        lines.push(`- Errors: ${scenario.errors.map(escapeMd).join("; ")}`);
        lines.push("");
      }
    }

    return `${lines.join("\n")}\n`;
  }
}

function escapeMd(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
