import { Command } from "commander";
import chalk from "chalk";
import { loadEnv } from "./config/env.js";
import { buildTargetConfig, createAuthHeaders } from "./config/target-config.js";
import { TestRunner } from "./core/test-runner/test-runner.js";
import { HttpApiConnector } from "./connectors/http-api/http-api-connector.js";
import type { HttpMethod } from "./connectors/http-api/types.js";
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
    const targetConfig = buildTargetConfig(env);

    console.log(chalk.bold("\nNusaTestLab"));
    console.log("----------------------------");
    console.log(`Target App    : ${targetConfig.appName}`);
    console.log(`Target Profile: ${targetConfig.profileName}`);
    console.log(`API Base URL  : ${targetConfig.apiBaseUrl}`);
    console.log(`Timeout       : ${targetConfig.timeoutMs}ms`);
    console.log(`Test Mode     : ${targetConfig.testMode}`);
    console.log("");
  });

program
  .command("probe")
  .description("Send a simple HTTP request to the target SaaS API.")
  .option("--path <path>", "Target API path.", "/health")
  .option("-m, --method <method>", "HTTP method.", "GET")
  .option("-r, --role <role>", "Auth role to use: none, owner, admin, cashier, invalid.", "none")
  .action(async (options: { path: string; method: string; role: string }) => {
    const env = loadEnv();
    const targetConfig = buildTargetConfig(env);

    const allowedMethods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    const normalizedMethod = options.method.toUpperCase();

    if (!allowedMethods.includes(normalizedMethod as HttpMethod)) {
      console.error(chalk.red(`Unsupported HTTP method: ${options.method}`));
      process.exit(1);
    }

    const method = normalizedMethod as HttpMethod;
    const headers = createAuthHeaders(targetConfig, options.role);

    const connector = new HttpApiConnector({
      baseURL: targetConfig.apiBaseUrl,
      timeoutMs: targetConfig.timeoutMs
    });

    console.log(chalk.bold("\nNusaTestLab API Probe"));
    console.log("----------------------------");
    console.log(`Target App : ${targetConfig.appName}`);
    console.log(`Base URL   : ${targetConfig.apiBaseUrl}`);
    console.log(`Path       : ${options.path}`);
    console.log(`Method     : ${method}`);
    console.log(`Role       : ${options.role}`);
    console.log("");

    const result = await connector.request({
      method,
      path: options.path,
      headers
    });

    if (result.ok) {
      console.log(chalk.green("Probe success."));
    } else {
      console.log(chalk.red("Probe failed."));
    }

    console.log("");
    console.log(`Status   : ${result.status} ${result.statusText ?? ""}`);
    console.log(`Duration : ${result.durationMs}ms`);

    if (result.error) {
      console.log(`Error    : ${result.error}`);
    }

    const preview = formatPayloadPreview(result.data);

    if (preview) {
      console.log("");
      console.log(chalk.gray("Response Preview:"));
      console.log(preview);
    }

    console.log("");

    process.exitCode = result.ok ? 0 : 1;
  });

program
  .command("run")
  .description("Run testing scenarios for the selected SaaS profile.")
  .option("-p, --profile <profile>", "Override selected SaaS testing profile.")
  .action(async (options: { profile?: string }) => {
    const env = loadEnv();
    const targetConfig = buildTargetConfig(env);
    const profileName = options.profile ?? targetConfig.profileName;

    console.log(chalk.bold("\nRunning NusaTestLab"));
    console.log("----------------------------");
    console.log(`Target App    : ${targetConfig.appName}`);
    console.log(`Target Profile: ${profileName}`);
    console.log(`API Base URL  : ${targetConfig.apiBaseUrl}`);
    console.log("");

    try {
      const runner = new TestRunner({
        profileName,
        target: {
          appName: targetConfig.appName,
          profileName,
          apiBaseUrl: targetConfig.apiBaseUrl,
          testMode: targetConfig.testMode,
          tenantId: targetConfig.tenantId,
          storeId: targetConfig.storeId
        }
      });

      const result = await runner.run();
      const reportWriter = new ReportWriter(env.REPORT_OUTPUT_DIR);
      const reportFiles = await reportWriter.write(result);

      const hasFailure = result.summary.failed > 0;

      console.log(
        hasFailure ? chalk.red("Test run completed with failures.") : chalk.green("Test run passed.")
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
      console.error(chalk.red("NusaTestLab failed to run."));
      console.error(chalk.red(message));
      process.exit(1);
    }
  });

function formatPayloadPreview(data: unknown): string {
  if (data === undefined || data === null) {
    return "";
  }

  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);

  if (!text) {
    return "";
  }

  if (text.length <= 800) {
    return text;
  }

  return `${text.slice(0, 800)}...`;
}

await program.parseAsync();
