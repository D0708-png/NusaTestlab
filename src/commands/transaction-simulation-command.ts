import { Command } from "commander";
import chalk from "chalk";
import { loadEnv } from "../config/env.js";
import { readJsonFile } from "../utils/json-file.js";
import type { AiUmkmDataset } from "../generators/ai-umkm/types.js";
import { ConcurrentTransactionSimulator } from "../performance/concurrent-transaction-simulator.js";
import { TransactionSimulationReportWriter } from "../performance/transaction-simulation-report-writer.js";

export function registerTransactionSimulationCommand(program: Command): void {
  program
    .command("performance:simulate-transactions")
    .description("Run local concurrent cashier transaction simulation using AI UMKM dataset.")
    .option("--file <file>", "AI UMKM dataset file.", "data/generated/ai-umkm-dataset.json")
    .option("--transactions <count>", "Number of simulated transactions.", "1000")
    .option("--concurrency <count>", "Number of simulated concurrent cashiers.", "10")
    .option("--max-items <count>", "Maximum items per transaction.", "5")
    .option("--seed <number>", "Simulation seed.", "303001")
    .action(async (options: Record<string, string>) => {
      const env = loadEnv();

      const dataset = await readJsonFile<AiUmkmDataset>(options.file);
      const simulator = new ConcurrentTransactionSimulator();

      const result = simulator.simulate(dataset, {
        transactions: toPositiveInteger(options.transactions, "transactions"),
        concurrency: toPositiveInteger(options.concurrency, "concurrency"),
        maxItemsPerTransaction: toPositiveInteger(options.maxItems, "max-items"),
        seed: toPositiveInteger(options.seed, "seed")
      });

      const writer = new TransactionSimulationReportWriter(env.REPORT_OUTPUT_DIR);
      const files = await writer.write(result);

      console.log(chalk.bold("\nNusaTestLab Concurrent Transaction Simulation"));
      console.log("---------------------------------------------");

      if (result.status === "passed") {
        console.log(chalk.green("Status   : passed"));
      } else {
        console.log(chalk.red("Status   : failed"));
      }

      console.log(`Dataset  : ${options.file}`);
      console.log(`Tx Total : ${result.summary.totalTransactions}`);
      console.log(`Completed: ${result.summary.completedTransactions}`);
      console.log(`Rejected : ${result.summary.rejectedTransactions}`);
      console.log(`Items    : ${result.summary.totalItemsSold}`);
      console.log(`Sales    : ${result.summary.totalSalesAmount}`);
      console.log(`Throughput: ${result.summary.throughputPerSecond} tx/s`);
      console.log(`Issues   : ${result.issues.length}`);
      console.log("");
      console.log(chalk.gray(`JSON Report    : ${files.latestJsonPath}`));
      console.log(chalk.gray(`Markdown Report: ${files.latestMarkdownPath}`));
      console.log("");

      process.exitCode = result.status === "failed" ? 1 : 0;
    });
}

function toPositiveInteger(value: string, label: string): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }

  return parsed;
}
