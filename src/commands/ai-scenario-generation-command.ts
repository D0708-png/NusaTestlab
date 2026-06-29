import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import chalk from "chalk";
import { AiGroundedScenarioBuilder } from "../ai-testing/ai-grounded-scenario-builder.js";
import type { AiUmkmDataset } from "../generators/ai-umkm/types.js";
import { readJsonFile } from "../utils/json-file.js";

export function registerAiScenarioGenerationCommand(program: Command): void {
  program
    .command("ai:generate-scenarios")
    .description("Generate dataset-grounded AI scenarios from an AI UMKM dataset.")
    .option("--dataset <file>", "AI UMKM dataset file.", "data/generated/ai-umkm-dataset.json")
    .option("--output <file>", "Output AI scenario file.", "data/generated/ai-umkm-ai.scenarios.json")
    .action(async (options: { dataset: string; output: string }) => {
      const dataset = await readJsonFile<AiUmkmDataset>(options.dataset);
      const builder = new AiGroundedScenarioBuilder();
      const scenarioFile = builder.buildFromAiUmkmDataset(dataset);

      await fs.mkdir(path.dirname(options.output), { recursive: true });
      await fs.writeFile(options.output, JSON.stringify(scenarioFile, null, 2), "utf-8");

      console.log(chalk.bold("\nAI Grounded Scenarios Generated"));
      console.log("--------------------------------");
      console.log(`Dataset   : ${options.dataset}`);
      console.log(`Output    : ${options.output}`);
      console.log(`Scenarios : ${scenarioFile.scenarios.length}`);
      console.log(`Seed      : ${scenarioFile.metadata.datasetSeed}`);
      console.log("");
    });
}
