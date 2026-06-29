import { nanoid } from "nanoid";
import { AssertionEngine } from "../assertion-engine/assertion-engine.js";
import { ResultCollector } from "../result-collector/result-collector.js";
import { ScenarioLoader } from "../scenario-loader/scenario-loader.js";
import type { TestRunResult, TestScenarioResult, TestTargetSummary } from "../types.js";

interface TestRunnerOptions {
  profileName: string;
  target: TestTargetSummary;
}

export class TestRunner {
  private readonly scenarioLoader = new ScenarioLoader();
  private readonly assertionEngine = new AssertionEngine();
  private readonly resultCollector = new ResultCollector();

  constructor(private readonly options: TestRunnerOptions) {}

  async run(): Promise<TestRunResult> {
    const runStartedAt = new Date();
    const scenarios = await this.scenarioLoader.loadScenarios(this.options.profileName);
    const scenarioResults: TestScenarioResult[] = [];

    for (const scenario of scenarios) {
      const scenarioStartedAt = new Date();

      const stepResults = scenario.steps.map((step) => {
        if (step.type === "assertion") {
          return this.assertionEngine.run(step);
        }

        return {
          stepId: step.id,
          name: step.name,
          type: step.type,
          status: "skipped" as const,
          durationMs: 0,
          message: "Unsupported step type."
        };
      });

      const scenarioCompletedAt = new Date();

      scenarioResults.push(
        this.resultCollector.collectScenarioResult(
          scenario,
          stepResults,
          scenarioStartedAt,
          scenarioCompletedAt
        )
      );
    }

    const runCompletedAt = new Date();

    return this.resultCollector.collectRunResult({
      runId: nanoid(10),
      target: this.options.target,
      profileName: this.options.profileName,
      scenarios: scenarioResults,
      startedAt: runStartedAt,
      completedAt: runCompletedAt
    });
  }
}
