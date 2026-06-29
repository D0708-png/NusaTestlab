import { Command } from "commander";
import chalk from "chalk";
import { loadEnv } from "./config/env.js";

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
    console.log(`Target App   : ${env.TARGET_APP_NAME}`);
    console.log(`Target Profile: ${env.TARGET_PROFILE}`);
    console.log(`API Base URL : ${env.TARGET_API_BASE_URL}`);
    console.log(`Test Mode    : ${env.TARGET_TEST_MODE}`);
    console.log("");
  });

program
  .command("run")
  .description("Run testing scenarios for the selected SaaS profile.")
  .action(() => {
    const env = loadEnv();

    console.log(chalk.bold("\nRunning NusaTestLab"));
    console.log("----------------------------");
    console.log(`Target App    : ${env.TARGET_APP_NAME}`);
    console.log(`Target Profile: ${env.TARGET_PROFILE}`);
    console.log("");

    console.log(chalk.yellow("Test runner is not implemented yet."));
    console.log(chalk.gray("Next major commit: core testing engine."));
    console.log("");
  });

program.parse();