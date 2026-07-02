import { Command } from "commander";
import chalk from "chalk";
import { loadEnv } from "../config/env.js";
import { BrowserTestRunner } from "../browser-testing/browser-test-runner.js";
import { BrowserTestReportWriter } from "../browser-testing/browser-test-report-writer.js";

export function registerBrowserTestCommand(program: Command): void {
  program
    .command("browser:run")
    .description("Run an initial browser test against a deployed website URL.")
    .requiredOption("--url <url>", "Target website URL.")
    .option("--max-links <number>", "Maximum links to check from the page.", "20")
    .option("--include-external", "Include external links in link checks.", false)
    .option("--timeout <ms>", "Page load timeout in milliseconds.", "30000")
    .option("--width <px>", "Browser viewport width.", "1365")
    .option("--height <px>", "Browser viewport height.", "768")
    .action(
      async (options: {
        url: string;
        maxLinks: string;
        includeExternal: boolean;
        timeout: string;
        width: string;
        height: string;
      }) => {
        try {
          validateUrl(options.url);

          const env = loadEnv();
          const runner = new BrowserTestRunner();
          const result = await runner.run({
            url: options.url,
            outputDir: env.REPORT_OUTPUT_DIR,
            maxLinks: parsePositiveInteger(options.maxLinks, "max-links"),
            includeExternal: options.includeExternal,
            timeoutMs: parsePositiveInteger(options.timeout, "timeout"),
            viewport: {
              width: parsePositiveInteger(options.width, "width"),
              height: parsePositiveInteger(options.height, "height")
            }
          });

          const writer = new BrowserTestReportWriter(env.REPORT_OUTPUT_DIR);
          const files = await writer.write(result);

          console.log(chalk.bold("\nNusaTestLab Browser Test"));
          console.log("-----------------------");
          console.log(`Target URL : ${result.targetUrl}`);
          console.log(`Final URL  : ${result.finalUrl}`);
          console.log(`Status     : ${formatStatus(result.status)}`);
          console.log(`Risk Score : ${result.riskScore}`);
          console.log(`Issues     : ${result.summary.issues}`);
          console.log(`Console Err: ${result.summary.consoleErrors}`);
          console.log(`Page Err   : ${result.summary.pageErrors}`);
          console.log(`Requests   : ${result.summary.failedRequests} failed`);
          console.log(`Links      : ${result.summary.linksChecked} checked, ${result.summary.brokenLinks} broken`);
          console.log(`Screenshot : ${result.screenshotPath ?? "-"}`);
          console.log("");
          console.log(chalk.gray(`JSON Report: ${files.latestJsonPath}`));
          console.log(chalk.gray(`MD Report  : ${files.latestMarkdownPath}`));
          console.log("");

          process.exitCode = result.status === "failed" ? 1 : 0;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(chalk.red("Failed to run browser test."));
          console.error(chalk.red(message));
          process.exit(1);
        }
      }
    );
}

function validateUrl(value: string): void {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("URL must use http or https.");
    }
  } catch {
    throw new Error("Invalid target URL.");
  }
}

function parsePositiveInteger(value: string, field: string): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${field} must be a positive integer.`);
  }

  return parsed;
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
