import { Command } from "commander";
import chalk from "chalk";
import { loadEnv } from "../config/env.js";
import { readJsonFile } from "../utils/json-file.js";
import type { AiUmkmDataset } from "../generators/ai-umkm/types.js";
import { StockValidator } from "../validators/ai-umkm/stock-validator.js";
import { ReportValidator } from "../validators/ai-umkm/report-validator.js";
import { ValidationReportWriter } from "../reports/validation-report-writer.js";

export function registerValidationCommands(program: Command): void {
  program
    .command("validate:inventory")
    .description("Validate AI UMKM inventory stock calculation from generated dataset.")
    .option("--file <file>", "Dataset file.", "data/generated/ai-umkm-dataset.json")
    .action(async (options: { file: string }) => {
      const env = loadEnv();
      const dataset = await readJsonFile<AiUmkmDataset>(options.file);
      const result = new StockValidator().validate(dataset);
      const writer = new ValidationReportWriter(env.REPORT_OUTPUT_DIR);

      const files = await writer.write({
        title: "AI UMKM Inventory Validation",
        filePrefix: "inventory-validation",
        status: result.status,
        summaryItems: {
          totalProducts: result.summary.totalProducts,
          passed: result.summary.passed,
          failed: result.summary.failed,
          totalMovements: result.summary.totalMovements,
          issues: result.issues.length
        },
        issues: result.issues,
        raw: result
      });

      console.log(chalk.bold("\nAI UMKM Inventory Validation"));
      console.log("-----------------------------");
      printValidationStatus(result.status);
      console.log(`Products : ${result.summary.totalProducts}`);
      console.log(`Passed   : ${result.summary.passed}`);
      console.log(`Failed   : ${result.summary.failed}`);
      console.log(`Issues   : ${result.issues.length}`);
      console.log("");
      console.log(chalk.gray(`JSON Report    : ${files.latestJsonPath}`));
      console.log(chalk.gray(`Markdown Report: ${files.latestMarkdownPath}`));
      console.log("");

      process.exitCode = result.status === "failed" ? 1 : 0;
    });

  program
    .command("validate:reports")
    .description("Validate AI UMKM business report calculation from generated dataset.")
    .option("--file <file>", "Dataset file.", "data/generated/ai-umkm-dataset.json")
    .action(async (options: { file: string }) => {
      const env = loadEnv();
      const dataset = await readJsonFile<AiUmkmDataset>(options.file);
      const result = new ReportValidator().validate(dataset);
      const writer = new ValidationReportWriter(env.REPORT_OUTPUT_DIR);

      const files = await writer.write({
        title: "AI UMKM Report Validation",
        filePrefix: "report-validation",
        status: result.status,
        summaryItems: {
          checkedFields: result.summary.checkedFields,
          passed: result.summary.passed,
          failed: result.summary.failed,
          issues: result.issues.length
        },
        issues: result.issues,
        raw: result
      });

      console.log(chalk.bold("\nAI UMKM Report Validation"));
      console.log("--------------------------");
      printValidationStatus(result.status);
      console.log(`Checked : ${result.summary.checkedFields}`);
      console.log(`Passed  : ${result.summary.passed}`);
      console.log(`Failed  : ${result.summary.failed}`);
      console.log(`Issues  : ${result.issues.length}`);
      console.log("");
      console.log(chalk.gray(`JSON Report    : ${files.latestJsonPath}`));
      console.log(chalk.gray(`Markdown Report: ${files.latestMarkdownPath}`));
      console.log("");

      process.exitCode = result.status === "failed" ? 1 : 0;
    });
}

function printValidationStatus(status: string): void {
  if (status === "passed") {
    console.log(chalk.green("Status   : passed"));
    return;
  }

  if (status === "warning") {
    console.log(chalk.yellow("Status   : warning"));
    return;
  }

  console.log(chalk.red("Status   : failed"));
}
