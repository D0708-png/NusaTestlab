import fs from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import type { TransactionSimulationResult } from "./transaction-simulation-types.js";

export class TransactionSimulationReportWriter {
  constructor(private readonly outputDir: string) {}

  async write(result: TransactionSimulationResult): Promise<{
    latestJsonPath: string;
    latestMarkdownPath: string;
    historyMarkdownPath: string;
  }> {
    const historyDir = path.join(this.outputDir, "history");

    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(historyDir, { recursive: true });

    const latestJsonPath = path.join(this.outputDir, "latest-transaction-simulation.json");
    const latestMarkdownPath = path.join(this.outputDir, "latest-transaction-simulation.md");
    const historyMarkdownPath = path.join(
      historyDir,
      `${dayjs(result.startedAt).format("YYYY-MM-DD-HHmmss")}-transaction-simulation.md`
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

  private toMarkdown(result: TransactionSimulationResult): string {
    const lines: string[] = [];

    lines.push("# NusaTestLab Concurrent Transaction Simulation Report");
    lines.push("");
    lines.push(`Status: \`${result.status}\``);
    lines.push(`Started At: \`${result.startedAt}\``);
    lines.push(`Completed At: \`${result.completedAt}\``);
    lines.push("");

    lines.push("## Dataset");
    lines.push("");
    lines.push(`- Seed: ${result.dataset.seed}`);
    lines.push(`- Products: ${result.dataset.productCount}`);
    lines.push(`- Cashiers: ${result.dataset.cashierCount}`);
    lines.push("");

    lines.push("## Options");
    lines.push("");
    lines.push(`- Transactions: ${result.options.transactions}`);
    lines.push(`- Concurrency: ${result.options.concurrency}`);
    lines.push(`- Max Items Per Transaction: ${result.options.maxItemsPerTransaction}`);
    lines.push(`- Seed: ${result.options.seed}`);
    lines.push("");

    lines.push("## Summary");
    lines.push("");
    lines.push(`- Total Transactions: ${result.summary.totalTransactions}`);
    lines.push(`- Completed Transactions: ${result.summary.completedTransactions}`);
    lines.push(`- Rejected Transactions: ${result.summary.rejectedTransactions}`);
    lines.push(`- Total Items Sold: ${result.summary.totalItemsSold}`);
    lines.push(`- Total Sales Amount: ${result.summary.totalSalesAmount}`);
    lines.push(`- Negative Stock Products: ${result.summary.negativeStockProducts}`);
    lines.push(`- Stock Mismatch Products: ${result.summary.stockMismatchProducts}`);
    lines.push(`- Duration: ${result.summary.durationMs}ms`);
    lines.push(`- Throughput: ${result.summary.throughputPerSecond} tx/s`);
    lines.push("");

    lines.push("## Issues");
    lines.push("");

    if (result.issues.length === 0) {
      lines.push("No issues found.");
    } else {
      lines.push("| Severity | Message | Context |");
      lines.push("|---|---|---|");

      for (const issue of result.issues) {
        lines.push(
          `| ${issue.severity} | ${escapeMd(issue.message)} | ${escapeMd(
            JSON.stringify(issue.context ?? {})
          )} |`
        );
      }
    }

    lines.push("");

    return `${lines.join("\n")}\n`;
  }
}

function escapeMd(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
