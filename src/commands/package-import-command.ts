import path from "node:path";
import { Command } from "commander";
import chalk from "chalk";
import { TestPackageImporter } from "../test-packages/test-package-importer.js";

export function registerPackageImportCommand(program: Command): void {
  program
    .command("package:import")
    .description("Import a portable NusaTestLab test package into profiles/.")
    .argument("<packagePath>", "Path to exported package JSON.")
    .option("--profile-name <name>", "Import package as a different profile name.")
    .option("--profiles-dir <dir>", "Profiles directory.", "profiles")
    .option("--overwrite", "Overwrite existing profile/files.", false)
    .option("--skip-checksum", "Skip checksum validation.", false)
    .action(
      async (
        packagePath: string,
        options: {
          profileName?: string;
          profilesDir: string;
          overwrite: boolean;
          skipChecksum: boolean;
        }
      ) => {
        try {
          const importer = new TestPackageImporter();

          const result = await importer.importPackage({
            packagePath: path.resolve(packagePath),
            profileName: options.profileName,
            profilesDir: path.resolve(options.profilesDir),
            overwrite: options.overwrite,
            skipChecksum: options.skipChecksum,
          });

          console.log(chalk.bold("\nNusaTestLab Test Package Imported"));
          console.log("----------------------------------");
          console.log(`Profile       : ${result.profileName}`);
          console.log(`Directory     : ${result.profileDir}`);
          console.log(`Checksum Valid: ${result.checksumValid ? "yes" : "no"}`);
          console.log(`Imported Files: ${result.importedFiles.length}`);
          console.log(`Skipped Files : ${result.skippedFiles.length}`);
          console.log("");

          console.log(chalk.green("Imported:"));
          for (const file of result.importedFiles) {
            console.log(`  - ${file}`);
          }

          if (result.skippedFiles.length > 0) {
            console.log("");
            console.log(chalk.yellow("Skipped:"));
            for (const file of result.skippedFiles) {
              console.log(`  - ${file}`);
            }
          }

          console.log("");
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);

          console.error(chalk.red("Failed to import test package."));
          console.error(chalk.red(message));
          process.exit(1);
        }
      }
    );
}
