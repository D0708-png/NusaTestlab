import type {
  TestRunResult,
  TestRunSummary,
  TestScenario,
  TestScenarioResult,
  TestStatus,
  TestStepResult,
  TestTargetSummary
} from "../types.js";

export class ResultCollector {
  collectScenarioResult(
    scenario: TestScenario,
    stepResults: TestStepResult[],
    startedAt: Date,
    completedAt: Date
  ): TestScenarioResult {
    const status = this.getScenarioStatus(stepResults);

    return {
      scenarioId: scenario.id,
      name: scenario.name,
      module: scenario.module,
      severity: scenario.severity,
      tags: scenario.tags,
      status,
      steps: stepResults,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime()
    };
  }

  collectRunResult(input: {
    runId: string;
    target: TestTargetSummary;
    profileName: string;
    scenarios: TestScenarioResult[];
    startedAt: Date;
    completedAt: Date;
  }): TestRunResult {
    return {
      runId: input.runId,
      target: input.target,
      profileName: input.profileName,
      summary: this.summarize(input.scenarios),
      scenarios: input.scenarios,
      startedAt: input.startedAt.toISOString(),
      completedAt: input.completedAt.toISOString(),
      durationMs: input.completedAt.getTime() - input.startedAt.getTime()
    };
  }

  private getScenarioStatus(stepResults: TestStepResult[]): TestStatus {
    if (stepResults.some((step) => step.status === "failed")) {
      return "failed";
    }

    if (stepResults.some((step) => step.status === "warning")) {
      return "warning";
    }

    if (stepResults.every((step) => step.status === "skipped")) {
      return "skipped";
    }

    return "passed";
  }

  private summarize(results: TestScenarioResult[]): TestRunSummary {
    const summary: TestRunSummary = {
      total: results.length,
      passed: 0,
      failed: 0,
      warning: 0,
      skipped: 0
    };

    for (const result of results) {
      summary[result.status] += 1;
    }

    return summary;
  }
}
