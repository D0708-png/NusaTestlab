import fs from "node:fs/promises";
import path from "node:path";
import type { DashboardComparisonReport } from "./dashboard-comparison-types.js";

export class DashboardComparisonWriter {
  constructor(private readonly outputDir: string) {}

  async write(report: DashboardComparisonReport): Promise<{
    jsonPath: string;
    markdownPath: string;
  }> {
    await fs.mkdir(this.outputDir, { recursive: true });

    const jsonPath = path.join(this.outputDir, "comparison.json");
    const markdownPath = path.join(this.outputDir, "comparison.md");

    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");
    await fs.writeFile(markdownPath, this.toMarkdown(report), "utf-8");

    return {
      jsonPath,
      markdownPath
    };
  }

  private toMarkdown(report: DashboardComparisonReport): string {
    const lines: string[] = [];

    lines.push("# NusaTestLab Dashboard Comparison");
    lines.push("");
    lines.push(`Generated At: \`${report.generatedAt}\``);
    lines.push(`Status: \`${report.status}\``);
    lines.push(`Trend: \`${report.summary.trend}\``);
    lines.push("");

    if (report.previousSnapshot) {
      lines.push(`Previous Snapshot: \`${report.previousSnapshot}\``);
    }

    if (report.currentSnapshot) {
      lines.push(`Current Snapshot: \`${report.currentSnapshot}\``);
    }

    lines.push("");
    lines.push("## Delta");
    lines.push("");
    lines.push(`- Risk Score Delta: ${report.delta.overallRiskScore}`);
    lines.push(`- Total Tests Delta: ${report.delta.totalTests}`);
    lines.push(`- Passed Delta: ${report.delta.totalPassed}`);
    lines.push(`- Failed Delta: ${report.delta.totalFailed}`);
    lines.push(`- Warning Delta: ${report.delta.totalWarnings}`);
    lines.push(`- Issues Delta: ${report.delta.totalIssues}`);
    lines.push("");

    lines.push("## Module Deltas");
    lines.push("");
    lines.push("| Module | Risk Delta | Failed Delta | Issue Delta | Current Risk |");
    lines.push("|---|---:|---:|---:|---:|");

    for (const module of report.modules) {
      lines.push(
        `| ${escapeMd(module.moduleName)} | ${module.riskDelta} | ${module.failedDelta} | ${module.issueDelta} | ${module.currentRiskScore} |`
      );
    }

    lines.push("");
    lines.push("## Notes");
    lines.push("");

    for (const note of report.notes) {
      lines.push(`- ${note}`);
    }

    lines.push("");

    return `${lines.join("\n")}\n`;
  }
}

function escapeMd(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
