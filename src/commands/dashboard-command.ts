import path from "node:path";
import { Command } from "commander";
import chalk from "chalk";
import { loadEnv } from "../config/env.js";
import { DashboardDataBuilder } from "../dashboard/dashboard-data-builder.js";
import { StaticDashboardWriter } from "../dashboard/static-dashboard-writer.js";

export function registerDashboardCommand(program: Command): void {
  program
    .command("dashboard:build")
    .description("Build static dashboard from latest NusaTestLab reports.")
    .option("--output <dir>", "Dashboard output directory.", "results/dashboard")
    .action(async (options: { output: string }) => {
      const env = loadEnv();
      const builder = new DashboardDataBuilder(env.REPORT_OUTPUT_DIR);
      const report = await builder.build();

      const writer = new StaticDashboardWriter(path.resolve(options.output));
      const files = await writer.write(report);

      console.log(chalk.bold("\nNusaTestLab Dashboard Built"));
      console.log("---------------------------");
      console.log(`Modules       : ${report.summary.modules}`);
      console.log(`Available     : ${report.summary.availableModules}`);
      console.log(`Missing       : ${report.summary.missingModules}`);
      console.log(`Total Tests   : ${report.summary.totalTests}`);
      console.log(`Failures      : ${report.summary.totalFailed}`);
      console.log(`Issues        : ${report.summary.totalIssues}`);
      console.log(`Risk Score    : ${report.summary.overallRiskScore}`);
      console.log(`Risk Level    : ${report.summary.overallRiskLevel}`);
      console.log("");
      console.log(chalk.gray(`HTML Dashboard: ${files.htmlPath}`));
      console.log(chalk.gray(`JSON Dashboard: ${files.jsonPath}`));
      console.log("");
    });
}
