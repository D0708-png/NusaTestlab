import path from "node:path";
import { Command } from "commander";
import chalk from "chalk";
import { DashboardHistoryComparator } from "../dashboard/dashboard-history-comparator.js";
import { DashboardComparisonWriter } from "../dashboard/dashboard-comparison-writer.js";

export function registerDashboardComparisonCommand(program: Command): void {
  program
    .command("dashboard:compare")
    .description("Compare latest dashboard snapshot against the previous snapshot.")
    .option("--dashboard-dir <dir>", "Dashboard output directory.", "results/dashboard")
    .action(async (options: { dashboardDir: string }) => {
      const dashboardDir = path.resolve(options.dashboardDir);

      const comparator = new DashboardHistoryComparator(dashboardDir);
      const report = await comparator.compareLatest();

      const writer = new DashboardComparisonWriter(dashboardDir);
      const files = await writer.write(report);

      console.log(chalk.bold("\nNusaTestLab Dashboard Comparison"));
      console.log("---------------------------------");
      console.log(`Status      : ${report.status}`);
      console.log(`Trend       : ${report.summary.trend}`);
      console.log(`Risk Delta  : ${report.delta.overallRiskScore}`);
      console.log(`Failed Delta: ${report.delta.totalFailed}`);
      console.log(`Issue Delta : ${report.delta.totalIssues}`);
      console.log("");
      console.log(chalk.gray(`JSON Report    : ${files.jsonPath}`));
      console.log(chalk.gray(`Markdown Report: ${files.markdownPath}`));
      console.log("");
    });
}
