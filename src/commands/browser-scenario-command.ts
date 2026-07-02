import { Command } from "commander";
import chalk from "chalk";
import { BrowserScenarioLoader } from "../browser-scenarios/browser-scenario-loader.js";
import { BrowserScenarioRunner } from "../browser-scenarios/browser-scenario-runner.js";
import { BrowserScenarioReportWriter } from "../browser-scenarios/browser-scenario-report-writer.js";

export function registerBrowserScenarioCommand(program: Command): void {
  program
    .command("browser:scenario")
    .description("Run a configurable browser scenario file.")
    .requiredOption("--file <path>", "Browser scenario JSON file path.")
    .option("--headed", "Run browser in headed mode.", false)
    .action(async (options: { file: string; headed: boolean }) => {
      try {
        const loader = new BrowserScenarioLoader();
        const scenario = await loader.load(options.file);

        const runner = new BrowserScenarioRunner({ headless: !options.headed });
        const result = await runner.run(scenario);

        const writer = new BrowserScenarioReportWriter();
        const files = await writer.write(result);

        console.log(chalk.bold("\nNusaTestLab Browser Scenario"));
        console.log("----------------------------");
        console.log(`Scenario  : ${result.scenarioName}`);
        console.log(`Base URL  : ${result.baseUrl}`);
        console.log(`Status    : ${formatStatus(result.status)}`);
        console.log(`Risk Score: ${result.riskScore}`);
        console.log(`Steps     : ${result.summary.passedSteps} passed, ${result.summary.failedSteps} failed, ${result.summary.skippedSteps} skipped`);
        console.log(`Issues    : ${result.issues.length}`);
        console.log(`Links     : ${result.summary.checkedLinks} checked, ${result.summary.brokenLinks} broken`);
        console.log("");
        console.log(chalk.gray(`JSON Report: ${files.jsonPath}`));
        console.log(chalk.gray(`MD Report  : ${files.markdownPath}`));
        console.log("");

        process.exitCode = result.status === "failed" ? 1 : 0;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(chalk.red("Browser scenario failed."));
        console.error(chalk.red(message));
        process.exit(1);
      }
    });
}

function formatStatus(status: string): string {
  if (status === "passed") {
    return chalk.green(status);
  }

  if (status === "warning") {
    return chalk.yellow(status);
  }

  return chalk.red(status);
}
