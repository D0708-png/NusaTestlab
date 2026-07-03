import fs from "node:fs/promises";
import path from "node:path";
import type { BrowserScenarioRunResult } from "./types.js";

export class BrowserScenarioReportWriter {
  constructor(private readonly outputDir = path.join(process.cwd(), "results")) {}

  async write(result: BrowserScenarioRunResult): Promise<{
    jsonPath: string;
    markdownPath: string;
  }> {
    await fs.mkdir(this.outputDir, { recursive: true });

    const jsonPath = path.join(this.outputDir, "latest-browser-scenario-report.json");
    const markdownPath = path.join(this.outputDir, "latest-browser-scenario-report.md");

    await fs.writeFile(jsonPath, JSON.stringify(result, null, 2), "utf-8");
    await fs.writeFile(markdownPath, this.toMarkdown(result), "utf-8");

    return { jsonPath, markdownPath };
  }

  private toMarkdown(result: BrowserScenarioRunResult): string {
    const lines: string[] = [];

    lines.push("# NusaTestLab Browser Scenario Report");
    lines.push("");
    lines.push(`Scenario: \`${result.scenarioName}\``);
    lines.push(`Scenario ID: \`${result.scenarioId}\``);
    lines.push(`Base URL: \`${result.baseUrl}\``);
    lines.push(`Status: \`${result.status}\``);
    lines.push(`Risk Score: \`${result.riskScore}\``);
    lines.push(`Duration: ${result.durationMs}ms`);
    lines.push("");

    lines.push("## Summary");
    lines.push("");
    lines.push(`- Total Steps: ${result.summary.totalSteps}`);
    lines.push(`- Passed Steps: ${result.summary.passedSteps}`);
    lines.push(`- Failed Steps: ${result.summary.failedSteps}`);
    lines.push(`- Skipped Steps: ${result.summary.skippedSteps}`);
    lines.push(`- Console Errors: ${result.summary.consoleErrors}`);
    lines.push(`- Page Errors: ${result.summary.pageErrors}`);
    lines.push(`- Failed Requests: ${result.summary.failedRequests}`);
    lines.push(`- Checked Links: ${result.summary.checkedLinks}`);
    lines.push(`- Broken Links: ${result.summary.brokenLinks}`);
    lines.push("");

    lines.push("## Steps");
    lines.push("");
    lines.push("| Step | Type | Status | Duration | Message |");
    lines.push("|---|---|---|---:|---|");

    for (const step of result.steps) {
      lines.push(
        `| ${escapeMd(step.id)} | ${escapeMd(step.type)} | ${escapeMd(step.status)} | ${step.durationMs}ms | ${escapeMd(step.message)} |`
      );
    }

    if (result.issues.length > 0) {
      lines.push("");
      lines.push("## Issues");
      lines.push("");
      lines.push("| Severity | Type | Message | Source |");
      lines.push("|---|---|---|---|");

      for (const issue of result.issues) {
        lines.push(
          `| ${escapeMd(issue.severity)} | ${escapeMd(issue.type)} | ${escapeMd(issue.message)} | ${escapeMd(issue.source ?? "-")} |`
        );
      }
    } else {
      lines.push("");
      lines.push("## Issues");
      lines.push("");
      lines.push("No issues detected.");
    }

    const linkChecks = result.linkChecks ?? [];

    if (linkChecks.length > 0) {
      lines.push("");
      lines.push("## Link Checks");
      lines.push("");
      lines.push("| URL | Status | Status Code | Error |");
      lines.push("|---|---|---:|---|");

      for (const link of linkChecks) {
        lines.push(
          `| ${escapeMd(link.url)} | ${escapeMd(link.status)} | ${link.statusCode ?? "-"} | ${escapeMd(link.error ?? "-")} |`
        );
      }
    }

    return `${lines.join("\n")}\n`;
  }
}

function escapeMd(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

