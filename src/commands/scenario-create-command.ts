import { Command } from "commander";
import chalk from "chalk";
import {
  ScenarioTemplateGenerator,
  type ScenarioTemplateType
} from "../scenario-templates/scenario-template-generator.js";

export function registerScenarioCreateCommand(program: Command): void {
  program
    .command("scenario:create")
    .description("Create a scenario template for an existing SaaS profile.")
    .argument("<profileName>", "Profile name. Example: ai-umkm")
    .argument("<type>", "Scenario type: core, security, performance, ai")
    .argument("<scenarioName>", "Scenario name in kebab-case.")
    .option("--module <module>", "Scenario module.")
    .option("--role <role>", "Role used by security/performance/AI scenarios.")
    .option("--method <method>", "HTTP method.", "GET")
    .option("--path <path>", "Endpoint path.")
    .option("--overwrite", "Overwrite existing scenario file.", false)
    .action(
      async (
        profileName: string,
        type: string,
        scenarioName: string,
        options: {
          module?: string;
          role?: string;
          method: string;
          path?: string;
          overwrite: boolean;
        }
      ) => {
        try {
          const scenarioType = normalizeScenarioType(type);
          const method = normalizeMethod(options.method);
          const generator = new ScenarioTemplateGenerator();

          const result = await generator.create({
            profileName,
            type: scenarioType,
            scenarioName,
            module: options.module,
            role: options.role,
            method,
            path: options.path,
            overwrite: options.overwrite
          });

          console.log(chalk.bold("\nNusaTestLab Scenario Template"));
          console.log("-----------------------------");
          console.log(`Profile : ${profileName}`);
          console.log(`Type    : ${scenarioType}`);
          console.log(`Scenario: ${scenarioName}`);
          console.log(`Output  : ${result.outputPath}`);
          console.log("");

          if (result.created) {
            console.log(chalk.green(result.message));
          } else {
            console.log(chalk.yellow(result.message));
          }

          console.log("");
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);

          console.error(chalk.red("Failed to create scenario template."));
          console.error(chalk.red(message));
          process.exit(1);
        }
      }
    );
}

function normalizeScenarioType(value: string): ScenarioTemplateType {
  if (value === "core" || value === "security" || value === "performance" || value === "ai") {
    return value;
  }

  throw new Error("Invalid scenario type. Use core, security, performance, or ai.");
}

function normalizeMethod(value: string): "GET" | "POST" | "PUT" | "PATCH" | "DELETE" {
  const normalized = value.toUpperCase();

  if (
    normalized === "GET" ||
    normalized === "POST" ||
    normalized === "PUT" ||
    normalized === "PATCH" ||
    normalized === "DELETE"
  ) {
    return normalized;
  }

  throw new Error("Invalid HTTP method. Use GET, POST, PUT, PATCH, or DELETE.");
}
