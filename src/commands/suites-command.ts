import { Command } from "commander";
import chalk from "chalk";
import { loadEnv } from "../config/env.js";
import { TestSuiteLoader } from "../test-suites/test-suite-loader.js";
import { TestSuiteRunner } from "../test-suites/test-suite-runner.js";
import { TestSuiteReportWriter } from "../test-suites/test-suite-report-writer.js";

interface SuiteRunOptions {
  failuresOnly: boolean;
}

export function registerSuitesCommand(program: Command): void {
  const suites = program
    .command("suites")
    .description("Manage NusaTestLab test suites.");

  suites
    .command("list")
    .description("List available test suites.")
    .action(async () => {
      const loader = new TestSuiteLoader();
      const suiteNames = await loader.list();

      console.log(chalk.bold("\nAvailable Test Suites"));
      console.log("---------------------");

      if (suiteNames.length === 0) {
        console.log(chalk.yellow("No suites found."));
        console.log("");
        return;
      }

      for (const suiteName of suiteNames) {
        console.log(`- ${suiteName}`);
      }

      console.log("");
    });

  suites
    .command("show")
    .description("Show test suite details.")
    .argument("<suite>", "Suite name or JSON file path.")
    .action(async (suiteName: string) => {
      const loader = new TestSuiteLoader();
      const suite = await loader.load(suiteName);

      console.log(chalk.bold("\nNusaTestLab Test Suite"));
      console.log("----------------------");
      console.log(`ID          : ${suite.id}`);
      console.log(`Name        : ${suite.name}`);
      console.log(`Profile     : ${suite.profile}`);
      console.log(`Mode        : ${suite.mode}`);
      console.log(`Tasks       : ${suite.tasks.length}`);

      if (suite.description) {
        console.log(`Description : ${suite.description}`);
      }

      console.log("");
      console.log(chalk.bold("Tasks:"));

      for (const task of suite.tasks) {
        const enabled = task.enabled ? chalk.green("enabled") : chalk.gray("disabled");
        console.log(`- ${task.id} (${task.type}) ${enabled}`);
      }

      console.log("");
    });

  suites
    .command("run")
    .description("Run a test suite.")
    .argument("<suite>", "Suite name or JSON file path.")
    .option("--failures-only", "Only print failed/skipped tasks in console output.", false)
    .action(async (suiteName: string, options: SuiteRunOptions) => {
      const env = loadEnv();
      const loader = new TestSuiteLoader();
      const suite = await loader.load(suiteName);

      const runner = new TestSuiteRunner();
      const result = await runner.run(suite);

      const writer = new TestSuiteReportWriter(env.REPORT_OUTPUT_DIR);
      const files = await writer.write(result, {
        failuresOnly: options.failuresOnly
      });

      console.log(chalk.bold("\nNusaTestLab Test Suite Run"));
      console.log("--------------------------");
      console.log(`Suite    : ${result.suiteName}`);
      console.log(`Profile  : ${result.profile}`);
      console.log(`Mode     : ${result.mode}`);

      if (result.status === "passed") {
        console.log(chalk.green("Status   : passed"));
      } else {
        console.log(chalk.red("Status   : failed"));
      }

      console.log("");
      console.log(`Total    : ${result.summary.total}`);
      console.log(`Passed   : ${result.summary.passed}`);
      console.log(`Failed   : ${result.summary.failed}`);
      console.log(`Skipped  : ${result.summary.skipped}`);
      console.log(`Duration : ${result.durationMs}ms`);

      if (options.failuresOnly) {
        console.log(chalk.gray("Output   : failures only"));
      }

      console.log("");

      const visibleTasks = options.failuresOnly
        ? result.tasks.filter((task) => task.status !== "passed")
        : result.tasks;

      console.log(chalk.bold(options.failuresOnly ? "Failures/Skipped:" : "Tasks:"));

      if (visibleTasks.length === 0) {
        console.log(chalk.green("- no failed or skipped tasks"));
      } else {
        for (const task of visibleTasks) {
          const status =
            task.status === "passed"
              ? chalk.green(task.status)
              : task.status === "failed"
                ? chalk.red(task.status)
                : chalk.gray(task.status);

          console.log(`- ${task.id} (${task.type}) ${status} ${task.durationMs}ms`);

          if (task.error) {
            console.log(chalk.gray(`  ${firstLine(task.error)}`));
          }
        }
      }

      console.log("");
      console.log(chalk.gray(`JSON Report    : ${files.latestJsonPath}`));
      console.log(chalk.gray(`Markdown Report: ${files.latestMarkdownPath}`));
      console.log(chalk.gray(`XML Report     : ${files.latestXmlPath}`));
      console.log("");

      process.exitCode = result.status === "failed" ? 1 : 0;
    });
}

function firstLine(value: string): string {
  return value.split(/\r?\n/).find(Boolean) ?? value;
}
