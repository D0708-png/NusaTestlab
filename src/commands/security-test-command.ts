import { Command } from "commander";
import chalk from "chalk";
import { loadEnv } from "../config/env.js";
import { buildTargetConfig } from "../config/target-config.js";
import { SecurityTestRunner } from "../security/security-test-runner.js";
import { SecurityReportWriter } from "../security/security-report-writer.js";
import type { SecurityTestMode } from "../security/types.js";

export function registerSecurityTestCommand(program: Command): void {
  program
    .command("security:run")
    .description("Run basic security testing scenarios for the selected SaaS profile.")
    .option("-p, --profile <profile>", "Profile name.")
    .option("--mode <mode>", "Security test mode: dry-run or live.", "dry-run")
    .action(async (options: { profile?: string; mode: string }) => {
      const env = loadEnv();
      const targetConfig = buildTargetConfig(env);
      const profileName = options.profile ?? targetConfig.profileName;
      const mode = normalizeMode(options.mode);

      console.log(chalk.bold("\nRunning NusaTestLab Security Tests"));
      console.log("-----------------------------------");
      console.log(`Target App    : ${targetConfig.appName}`);
      console.log(`Target Profile: ${profileName}`);
      console.log(`API Base URL  : ${targetConfig.apiBaseUrl}`);
      console.log(`Mode          : ${mode}`);
      console.log("");

      try {
        const runner = new SecurityTestRunner({
          profileName,
          targetConfig,
          mode
        });

        const result = await runner.run();
        const reportWriter = new SecurityReportWriter(env.REPORT_OUTPUT_DIR);
        const reportFiles = await reportWriter.write(result);
        const hasFailure = result.summary.failed > 0;

        console.log(
          hasFailure
            ? chalk.red("Security test run completed with failures.")
            : chalk.green("Security test run passed.")
        );

        console.log("");
        console.log(`Total   : ${result.summary.total}`);
        console.log(`Passed  : ${result.summary.passed}`);
        console.log(`Failed  : ${result.summary.failed}`);
        console.log(`Warning : ${result.summary.warning}`);
        console.log(`Skipped : ${result.summary.skipped}`);
        console.log("");
        console.log(chalk.gray(`JSON Report    : ${reportFiles.latestJsonPath}`));
        console.log(chalk.gray(`Markdown Report: ${reportFiles.latestMarkdownPath}`));
        console.log("");

        process.exitCode = hasFailure ? 1 : 0;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        console.error(chalk.red("Security test run failed."));
        console.error(chalk.red(message));
        process.exit(1);
      }
    });
}

function normalizeMode(value: string): SecurityTestMode {
  if (value === "dry-run" || value === "live") {
    return value;
  }

  throw new Error("Invalid security mode. Use dry-run or live.");
}
