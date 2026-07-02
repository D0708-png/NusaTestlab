import fs from "node:fs/promises";
import path from "node:path";
import type { BrowserTestResult } from "./types.js";

export class BrowserTestReportWriter {
  constructor(private readonly outputDir: string) {}

  async write(result: BrowserTestResult): Promise<{
    latestJsonPath: string;
    latestMarkdownPath: string;
  }> {
    await fs.mkdir(this.outputDir, { recursive: true });

    const latestJsonPath = path.join(this.outputDir, "latest-browser-report.json");
    const latestMarkdownPath = path.join(this.outputDir, "latest-browser-report.md");

    await fs.writeFile(latestJsonPath, JSON.stringify(result, null, 2), "utf-8");
    await fs.writeFile(latestMarkdownPath, this.toMarkdown(result), "utf-8");

    return {
      latestJsonPath,
      latestMarkdownPath
    };
  }

  private toMarkdown(result: BrowserTestResult): string {
    const lines: string[] = [];

    lines.push("# NusaTestLab Browser Test Report");
    lines.push("");
    lines.push(`Target URL: \`${result.targetUrl}\``);
    lines.push(`Final URL: \`${result.finalUrl}\``);
    lines.push(`Status: \`${result.status}\``);
    lines.push(`Risk Score: \`${result.riskScore}\``);
    lines.push(`Started At: \`${result.startedAt}\``);
    lines.push(`Completed At: \`${result.completedAt}\``);
    lines.push(`Duration: ${result.durationMs}ms`);
    lines.push(`Viewport: ${result.viewport.width}x${result.viewport.height}`);

    if (result.screenshotPath) {
      lines.push(`Screenshot: \`${result.screenshotPath}\``);
    }

    lines.push("");
    lines.push("## Summary");
    lines.push("");
    lines.push(`- Issues: ${result.summary.issues}`);
    lines.push(`- Console Errors: ${result.summary.consoleErrors}`);
    lines.push(`- Page Errors: ${result.summary.pageErrors}`);
    lines.push(`- Failed Requests: ${result.summary.failedRequests}`);
    lines.push(`- Links Checked: ${result.summary.linksChecked}`);
    lines.push(`- Broken Links: ${result.summary.brokenLinks}`);
    lines.push("");

    lines.push("## Issues");
    lines.push("");

    if (result.issues.length === 0) {
      lines.push("No issues detected.");
    } else {
      lines.push("| Severity | Category | Message | URL | Detail |");
      lines.push("|---|---|---|---|---|");

      for (const issue of result.issues) {
        lines.push(
          `| ${escapeMd(issue.severity)} | ${escapeMd(issue.category)} | ${escapeMd(issue.message)} | ${escapeMd(issue.url ?? "-")} | ${escapeMd(issue.detail ?? "-")} |`
        );
      }
    }

    lines.push("");
    lines.push("## Link Checks");
    lines.push("");

    if (result.linkChecks.length === 0) {
      lines.push("No links checked.");
    } else {
      lines.push("| Status | Status Code | URL | Error |");
      lines.push("|---|---:|---|---|");

      for (const link of result.linkChecks) {
        lines.push(
          `| ${escapeMd(link.status)} | ${link.statusCode ?? "-"} | ${escapeMd(link.url)} | ${escapeMd(link.error ?? "-")} |`
        );
      }
    }

    return `${lines.join("\n")}\n`;
  }
}

function escapeMd(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}
