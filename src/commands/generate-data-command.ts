import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import chalk from "chalk";
import { MinimarketDataGenerator } from "../generators/ai-umkm/minimarket-generator.js";

export function registerGenerateDataCommand(program: Command): void {
  program
    .command("generate:data")
    .description("Generate dummy dataset for a selected SaaS profile.")
    .option("-p, --profile <profile>", "Profile name.", "ai-umkm")
    .option("--products <count>", "Number of products.", "100")
    .option("--suppliers <count>", "Number of suppliers.", "5")
    .option("--purchases <count>", "Number of purchase transactions.", "200")
    .option("--sales <count>", "Number of sales transactions.", "1000")
    .option("--seed <number>", "Deterministic random seed.", "20260629")
    .option("--output <file>", "Output dataset file.", "data/generated/ai-umkm-dataset.json")
    .action(async (options: Record<string, string>) => {
      if (options.profile !== "ai-umkm") {
        console.error(chalk.red("generate:data currently supports only the ai-umkm profile."));
        process.exit(1);
      }

      const generator = new MinimarketDataGenerator();

      const dataset = generator.generate({
        productCount: toPositiveInteger(options.products, "products"),
        supplierCount: toPositiveInteger(options.suppliers, "suppliers"),
        purchaseCount: toPositiveInteger(options.purchases, "purchases"),
        salesCount: toPositiveInteger(options.sales, "sales"),
        seed: toPositiveInteger(options.seed, "seed")
      });

      const outputPath = options.output;

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, JSON.stringify(dataset, null, 2), "utf-8");

      console.log(chalk.bold("\nAI UMKM Dummy Dataset Generated"));
      console.log("--------------------------------");
      console.log(`Output       : ${outputPath}`);
      console.log(`Products     : ${dataset.products.length}`);
      console.log(`Suppliers    : ${dataset.suppliers.length}`);
      console.log(`Purchases    : ${dataset.purchaseTransactions.length}`);
      console.log(`Sales        : ${dataset.salesTransactions.length}`);
      console.log(`Movements    : ${dataset.stockMovements.length}`);
      console.log(`Seed         : ${dataset.metadata.seed}`);
      console.log("");
    });
}

function toPositiveInteger(value: string, label: string): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }

  return parsed;
}
