import { Command } from "commander";
import chalk from "chalk";
import { loadEnv } from "../config/env.js";
import { buildTargetConfig } from "../config/target-config.js";
import { AiTestRunner } from "../ai-testing/ai-test-runner.js";
import { AiReportWriter } from "../ai-testing/ai-report-writer.js";
import type { AiTestMode } from "../ai-testing/types.js";

export function registerAiTestCommand(program: Command): void {
  program
    .command("ai:run")
    .description("Run AI response testing scenarios for the selected SaaS profile.")
    .option("-p, --profile <profile>", "Profile name.")
    .option("--mode <mode>", "AI test mode: dry-run or live.", "dry-run")
    .option("--file <file>", "Custom AI scenario file.")
    .action(async (options: { profile?: string; mode: string; file?: string }) => {
      const env = loadEnv();
      const targetConfig = buildTargetConfig(env);
      const profileName = options.profile ?? targetConfig.profileName;
      const mode = normalizeMode(options.mode);

      console.log(chalk.bold("\nRunning NusaTestLab AI Tests"));
      console.log("-----------------------------");
      console.log(`Target App    : ${targetConfig.appName}`);
      console.log(`Target Profile: ${profileName}`);
      console.log(`API Base URL  : ${targetConfig.apiBaseUrl}`);
      console.log(`Mode          : ${mode}`);

      if (options.file) {
        console.log(`Scenario File : ${options.file}`);
      }

      console.log("");

      try {
        const runner = new AiTestRunner({
          profileName,
          targetConfig,
          mode,
          scenarioFile: options.file
        });

        const result = await runner.run();
        const writer = new AiReportWriter(env.REPORT_OUTPUT_DIR);
        const files = await writer.write(result);
        const hasFailure = result.summary.failed > 0;

        console.log(
          hasFailure
            ? chalk.red("AI test run completed with failures.")
            : chalk.green("AI test run passed.")
        );

        console.log("");
        console.log(`Total   : ${result.summary.total}`);
        console.log(`Passed  : ${result.summary.passed}`);
        console.log(`Failed  : ${result.summary.failed}`);
        console.log(`Warning : ${result.summary.warning}`);
        console.log(`Skipped : ${result.summary.skipped}`);
        console.log("");
        console.log(chalk.gray(`JSON Report    : ${files.latestJsonPath}`));
        console.log(chalk.gray(`Markdown Report: ${files.latestMarkdownPath}`));
        console.log("");

        process.exitCode = hasFailure ? 1 : 0;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        console.error(chalk.red("AI test run failed."));
        console.error(chalk.red(message));
        process.exit(1);
      }
    });
}

function normalizeMode(value: string): AiTestMode {
  if (value === "dry-run" || value === "live") {
    return value;
  }

  throw new Error("Invalid AI test mode. Use dry-run or live.");
}
