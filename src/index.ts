import { Command } from "commander";
import chalk from "chalk";
import { loadEnv } from "./config/env.js";
import { TestRunner } from "./core/test-runner/test-runner.js";
import { ReportWriter } from "./reports/report-writer.js";

const program = new Command();

program
  .name("nusa-testlab")
  .description("Standalone SaaS testing tool with profile-based test scenarios.")
  .version("0.1.0");

program
  .command("info")
  .description("Show current NusaTestLab target configuration.")
  .action(() => {
    const env = loadEnv();

    console.log(chalk.bold("\nNusaTestLab"));
    console.log("----------------------------");
    console.log(`Target App    : ${env.TARGET_APP_NAME}`);
    console.log(`Target Profile: ${env.TARGET_PROFILE}`);
    console.log(`API Base URL  : ${env.TARGET_API_BASE_URL}`);
    console.log(`Test Mode     : ${env.TARGET_TEST_MODE}`);
    console.log("");
  });

program
  .command("run")
  .description("Run testing scenarios for the selected SaaS profile.")
  .option("-p, --profile <profile>", "Override selected SaaS testing profile.")
  .action(async (options: { profile?: string }) => {
    const env = loadEnv();
    const profileName = options.profile ?? env.TARGET_PROFILE;

    console.log(chalk.bold("\nRunning NusaTestLab"));
    console.log("----------------------------");
    console.log(`Target App    : ${env.TARGET_APP_NAME}`);
    console.log(`Target Profile: ${profileName}`);
    console.log(`API Base URL  : ${env.TARGET_API_BASE_URL}`);
    console.log("");

    try {
      const runner = new TestRunner({
        profileName,
        target: {
          appName: env.TARGET_APP_NAME,
          profileName,
          apiBaseUrl: env.TARGET_API_BASE_URL,
          testMode: env.TARGET_TEST_MODE,
          tenantId: env.TEST_TENANT_ID,
          storeId: env.TEST_STORE_ID
        }
      });

      const result = await runner.run();
      const reportWriter = new ReportWriter(env.REPORT_OUTPUT_DIR);
      const reportFiles = await reportWriter.write(result);

      const hasFailure = result.summary.failed > 0;

      console.log(hasFailure ? chalk.red("Test run completed with failures.") : chalk.green("Test run passed."));
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
      console.error(chalk.red("NusaTestLab failed to run."));
      console.error(chalk.red(message));
      process.exit(1);
    }
  });

await program.parseAsync();
