import { spawn } from "node:child_process";
import { Command } from "commander";
import chalk from "chalk";
import { GuiDashboardBuilder } from "../gui-dashboard/gui-dashboard-builder.js";

export function registerGuiDashboardCommand(program: Command): void {
  program
    .command("gui:build")
    .description("Build local NusaTestLab GUI dashboard from latest reports.")
    .action(async () => {
      const builder = new GuiDashboardBuilder();
      const result = await builder.build();

      console.log(chalk.bold("\nNusaTestLab GUI Dashboard"));
      console.log("-------------------------");
      console.log(`Output     : ${result.outputPath}`);
      console.log(`Suite      : ${result.reports.suite ? "found" : "missing"}`);
      console.log(`Browser    : ${result.reports.browser ? "found" : "missing"}`);
      console.log(`Scenario   : ${result.reports.browserScenario ? "found" : "missing"}`);
      console.log("");
    });

  program
    .command("gui:open")
    .description("Build and open local NusaTestLab GUI dashboard.")
    .action(async () => {
      const builder = new GuiDashboardBuilder();
      const result = await builder.build();

      console.log(chalk.bold("\nNusaTestLab GUI Dashboard"));
      console.log("-------------------------");
      console.log(`Output     : ${result.outputPath}`);
      console.log("");

      openFile(result.outputPath);
    });
}

function openFile(filePath: string): void {
  const command = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
  spawn(command, [filePath], {
    shell: true,
    detached: true,
    stdio: "ignore"
  }).unref();
}
