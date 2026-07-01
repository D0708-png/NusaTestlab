import { spawn } from "node:child_process";
import type {
  TestSuiteConfig,
  TestSuiteRunResult,
  TestSuiteTask,
  TestSuiteTaskResult
} from "./types.js";

export class TestSuiteRunner {
  async run(suite: TestSuiteConfig): Promise<TestSuiteRunResult> {
    const startedAtDate = new Date();
    const startedAt = Date.now();
    const results: TestSuiteTaskResult[] = [];

    for (const task of suite.tasks) {
      if (!task.enabled) {
        results.push({
          id: task.id,
          type: task.type,
          status: "skipped",
          durationMs: 0,
          message: "Task disabled."
        });

        continue;
      }

      const result = await this.runTask(suite, task);
      results.push(result);

      if (result.status === "failed" && !task.continueOnFailure) {
        const remainingTasks = suite.tasks.slice(suite.tasks.indexOf(task) + 1);

        for (const remainingTask of remainingTasks) {
          if (!remainingTask.enabled) {
            continue;
          }

          results.push({
            id: remainingTask.id,
            type: remainingTask.type,
            status: "skipped",
            durationMs: 0,
            message: "Skipped because previous task failed."
          });
        }

        break;
      }
    }

    const completedAtDate = new Date();
    const failed = results.filter((result) => result.status === "failed").length;

    return {
      suiteId: suite.id,
      suiteName: suite.name,
      profile: suite.profile,
      mode: suite.mode,
      status: failed > 0 ? "failed" : "passed",
      summary: {
        total: results.length,
        passed: results.filter((result) => result.status === "passed").length,
        failed,
        skipped: results.filter((result) => result.status === "skipped").length
      },
      tasks: results,
      startedAt: startedAtDate.toISOString(),
      completedAt: completedAtDate.toISOString(),
      durationMs: Date.now() - startedAt
    };
  }

  private async runTask(
    suite: TestSuiteConfig,
    task: TestSuiteTask
  ): Promise<TestSuiteTaskResult> {
    const startedAt = Date.now();

    try {
      const args = this.resolveTaskArgs(suite, task);
      const result = await runNodeCommand(args);

      return {
        id: task.id,
        type: task.type,
        status: result.exitCode === 0 ? "passed" : "failed",
        durationMs: Date.now() - startedAt,
        message: result.exitCode === 0 ? "Task passed." : "Task failed.",
        error: result.exitCode === 0 ? undefined : result.stderr || result.stdout
      };
    } catch (error) {
      return {
        id: task.id,
        type: task.type,
        status: "failed",
        durationMs: Date.now() - startedAt,
        message: "Task execution failed.",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private resolveTaskArgs(suite: TestSuiteConfig, task: TestSuiteTask): string[] {
    if (task.type === "core") {
      return ["tsx", "src/index.ts", "run", suite.profile];
    }

    if (task.type === "inventory-validation") {
      return ["tsx", "src/index.ts", "validate:inventory"];
    }

    if (task.type === "report-validation") {
      return ["tsx", "src/index.ts", "validate:reports"];
    }

    if (task.type === "security") {
      return ["tsx", "src/index.ts", "security:run", "-p", suite.profile, "--mode", suite.mode];
    }

    if (task.type === "performance") {
      return ["tsx", "src/index.ts", "performance:run", "-p", suite.profile, "--mode", suite.mode];
    }

    if (task.type === "dashboard-build") {
      return ["tsx", "src/index.ts", "dashboard:build"];
    }

    if (task.type === "dashboard-compare") {
      return ["tsx", "src/index.ts", "dashboard:compare"];
    }

    throw new Error(`Unsupported suite task type: ${task.type}`);
  }
}

function runNodeCommand(args: string[]): Promise<{
  exitCode: number;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve) => {
    const child = spawn("npx", args, {
      shell: true,
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("close", (exitCode) => {
      resolve({
        exitCode: exitCode ?? 1,
        stdout,
        stderr
      });
    });
  });
}
