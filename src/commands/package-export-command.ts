import path from "node:path";
import { Command } from "commander";
import chalk from "chalk";
import { TestPackageExporter } from "../test-packages/test-package-exporter.js";

export function registerPackageExportCommand(program: Command): void {
  program
    .command("package:export")
    .description("Export a SaaS testing profile into a portable NusaTestLab package.")
    .argument("<profileName>", "Profile name. Example: ai-umkm")
    .option("--output <dir>", "Output directory.", "exports/packages")
    .option("--file <file>", "Output file name.")
    .action(
      async (
        profileName: string,
        options: {
          output: string;
          file?: string;
        }
      ) => {
        try {
          const exporter = new TestPackageExporter();

          const result = await exporter.export({
            profileName,
            outputDir: path.resolve(options.output),
            outputFile: options.file
          });

          console.log(chalk.bold("\nNusaTestLab Test Package Exported"));
          console.log("----------------------------------");
          console.log(`Profile       : ${profileName}`);
          console.log(`Package Format: ${result.package.packageFormat}`);
          console.log(`Package Ver.  : ${result.package.packageVersion}`);
          console.log(`Files         : ${result.package.summary.files}`);
          console.log(`Core          : ${result.package.summary.coreScenarioFiles}`);
          console.log(`Security      : ${result.package.summary.securityScenarioFiles}`);
          console.log(`Performance   : ${result.package.summary.performanceScenarioFiles}`);
          console.log(`AI            : ${result.package.summary.aiScenarioFiles}`);
          console.log(`Checksum      : ${result.package.checksum}`);
          console.log("");
          console.log(chalk.gray(`Package Path  : ${result.packagePath}`));
          console.log("");
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);

          console.error(chalk.red("Failed to export test package."));
          console.error(chalk.red(message));
          process.exit(1);
        }
      }
    );
}
