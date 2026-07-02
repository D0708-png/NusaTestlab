import { Command } from "commander";
import chalk from "chalk";
import { BrowserScenarioManager, type ManagedBrowserScenarioStep } from "../browser-scenarios/browser-scenario-manager.js";

export function registerBrowserScenarioManagerCommands(program: Command): void {
  program
    .command("browser:scenario:list")
    .description("List available browser scenarios.")
    .action(async () => {
      const manager = new BrowserScenarioManager();
      const scenarios = await manager.list();

      console.log(chalk.bold("\nBrowser Scenarios"));
      console.log("-----------------");

      if (scenarios.length === 0) {
        console.log(chalk.yellow("No browser scenarios found."));
        console.log("");
        return;
      }

      for (const scenario of scenarios) {
        console.log(`- ${scenario}`);
      }

      console.log("");
    });

  program
    .command("browser:scenario:show")
    .description("Show browser scenario details.")
    .argument("<scenarioId>", "Scenario id from browser-scenarios/<id>.json")
    .action(async (scenarioId: string) => {
      const manager = new BrowserScenarioManager();
      const scenario = await manager.load(scenarioId);

      console.log(chalk.bold("\nBrowser Scenario"));
      console.log("----------------");
      console.log(`ID      : ${scenario.id}`);
      console.log(`Name    : ${scenario.name}`);
      console.log(`Base URL: ${scenario.baseUrl}`);
      console.log(`Steps   : ${scenario.steps.length}`);
      console.log("");
      console.log(chalk.bold("Steps:"));

      for (const step of scenario.steps) {
        const enabled = step.enabled === false ? chalk.gray("disabled") : chalk.green("enabled");
        console.log(`- ${step.id} (${step.type}) ${enabled}`);
      }

      console.log("");
    });

  program
    .command("browser:scenario:create")
    .description("Create a browser scenario file.")
    .argument("<scenarioId>", "Scenario id.")
    .requiredOption("--base-url <url>", "Base URL to test.")
    .option("--name <name>", "Scenario display name.")
    .option("--force", "Overwrite existing scenario file.", false)
    .action(async (scenarioId: string, options: { baseUrl: string; name?: string; force?: boolean }) => {
      const manager = new BrowserScenarioManager();
      const filePath = await manager.create({
        id: scenarioId,
        name: options.name ?? scenarioId,
        baseUrl: options.baseUrl,
        force: options.force
      });

      console.log(chalk.green("Browser scenario created."));
      console.log(`File: ${filePath}`);
    });

  program
    .command("browser:scenario:add-step")
    .description("Add a step to a browser scenario.")
    .argument("<scenarioId>", "Scenario id.")
    .requiredOption("--type <type>", "Step type: goto, expect-text, click, fill, check-links, screenshot.")
    .requiredOption("--id <id>", "Step id.")
    .option("--path <path>", "Path for goto step.")
    .option("--url <url>", "Absolute URL for goto step.")
    .option("--selector <selector>", "CSS selector for click/fill step.")
    .option("--text <text>", "Text expectation or fill value.")
    .option("--value <value>", "Fill value.")
    .option("--max-links <count>", "Maximum links to check.")
    .action(async (
      scenarioId: string,
      options: {
        type: string;
        id: string;
        path?: string;
        url?: string;
        selector?: string;
        text?: string;
        value?: string;
        maxLinks?: string;
      }
    ) => {
      const manager = new BrowserScenarioManager();
      const step = buildStep(options);

      await manager.addStep({ scenarioId, step });

      console.log(chalk.green("Browser scenario step added."));
      console.log(`Scenario: ${scenarioId}`);
      console.log(`Step    : ${step.id} (${step.type})`);
    });

  program
    .command("browser:scenario:disable-step")
    .description("Disable a browser scenario step.")
    .argument("<scenarioId>", "Scenario id.")
    .requiredOption("--step-id <stepId>", "Step id.")
    .action(async (scenarioId: string, options: { stepId: string }) => {
      const manager = new BrowserScenarioManager();
      await manager.setStepEnabled(scenarioId, options.stepId, false);
      console.log(chalk.green("Browser scenario step disabled."));
    });

  program
    .command("browser:scenario:enable-step")
    .description("Enable a browser scenario step.")
    .argument("<scenarioId>", "Scenario id.")
    .requiredOption("--step-id <stepId>", "Step id.")
    .action(async (scenarioId: string, options: { stepId: string }) => {
      const manager = new BrowserScenarioManager();
      await manager.setStepEnabled(scenarioId, options.stepId, true);
      console.log(chalk.green("Browser scenario step enabled."));
    });

  program
    .command("browser:scenario:delete-step")
    .description("Delete a browser scenario step.")
    .argument("<scenarioId>", "Scenario id.")
    .requiredOption("--step-id <stepId>", "Step id.")
    .action(async (scenarioId: string, options: { stepId: string }) => {
      const manager = new BrowserScenarioManager();
      await manager.deleteStep(scenarioId, options.stepId);
      console.log(chalk.green("Browser scenario step deleted."));
    });
}

function buildStep(options: {
  type: string;
  id: string;
  path?: string;
  url?: string;
  selector?: string;
  text?: string;
  value?: string;
  maxLinks?: string;
}): ManagedBrowserScenarioStep {
  const step: ManagedBrowserScenarioStep = {
    id: options.id,
    type: options.type,
    enabled: true
  };

  if (options.path) step.path = options.path;
  if (options.url) step.url = options.url;
  if (options.selector) step.selector = options.selector;
  if (options.text) step.text = options.text;
  if (options.value) step.value = options.value;
  if (options.maxLinks) step.maxLinks = Number(options.maxLinks);

  return step;
}
