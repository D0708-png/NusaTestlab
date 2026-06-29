import fs from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import type { ValidationIssue, ValidationStatus } from "../validators/ai-umkm/types.js";

interface ValidationReportInput {
  title: string;
  filePrefix: string;
  status: ValidationStatus;
  summaryItems: Record<string, string | number | boolean>;
  issues: ValidationIssue[];
  raw: unknown;
}

interface ValidationReportFiles {
  latestJsonPath: string;
  latestMarkdownPath: string;
  historyMarkdownPath: string;
}

export class ValidationReportWriter {
  constructor(private readonly outputDir: string) {}

  async write(input: ValidationReportInput): Promise<ValidationReportFiles> {
    const historyDir = path.join(this.outputDir, "history");

    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(historyDir, { recursive: true });

    const latestJsonPath = path.join(this.outputDir, `latest-${input.filePrefix}.json`);
    const latestMarkdownPath = path.join(this.outputDir, `latest-${input.filePrefix}.md`);
    const historyMarkdownPath = path.join(
      historyDir,
      `${dayjs().format("YYYY-MM-DD-HHmmss")}-${input.filePrefix}.md`
    );

    const markdown = this.toMarkdown(input);

    await fs.writeFile(latestJsonPath, JSON.stringify(input.raw, null, 2), "utf-8");
    await fs.writeFile(latestMarkdownPath, markdown, "utf-8");
    await fs.writeFile(historyMarkdownPath, markdown, "utf-8");

    return {
      latestJsonPath,
      latestMarkdownPath,
      historyMarkdownPath
    };
  }

  private toMarkdown(input: ValidationReportInput): string {
    const lines: string[] = [];

    lines.push(`# ${input.title}`);
    lines.push("");
    lines.push(`Status: \`${input.status}\``);
    lines.push("");

    lines.push("## Summary");
    lines.push("");

    for (const [key, value] of Object.entries(input.summaryItems)) {
      lines.push(`- ${key}: ${value}`);
    }

    lines.push("");

    if (input.issues.length > 0) {
      lines.push("## Issues");
      lines.push("");
      lines.push("| Severity | Message | Context |");
      lines.push("|---|---|---|");

      for (const issue of input.issues) {
        lines.push(
          `| ${issue.severity} | ${escapeMarkdown(issue.message)} | ${escapeMarkdown(
            JSON.stringify(issue.context ?? {})
          )} |`
        );
      }
    } else {
      lines.push("## Issues");
      lines.push("");
      lines.push("No issues found.");
    }

    lines.push("");

    return `${lines.join("\n")}\n`;
  }
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
