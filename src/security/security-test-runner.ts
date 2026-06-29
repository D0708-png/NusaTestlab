import { nanoid } from "nanoid";
import { HttpApiConnector } from "../connectors/http-api/http-api-connector.js";
import { createAuthHeaders, type TargetSaaSConfig } from "../config/target-config.js";
import { SecurityScenarioLoader } from "./security-scenario-loader.js";
import type {
  SecurityRunResult,
  SecurityRunSummary,
  SecurityScenario,
  SecurityScenarioResult,
  SecurityTestMode
} from "./types.js";

interface SecurityTestRunnerOptions {
  profileName: string;
  targetConfig: TargetSaaSConfig;
  mode: SecurityTestMode;
}

export class SecurityTestRunner {
  private readonly loader = new SecurityScenarioLoader();

  constructor(private readonly options: SecurityTestRunnerOptions) {}

  async run(): Promise<SecurityRunResult> {
    const startedAt = new Date();
    const scenarios = await this.loader.load(this.options.profileName);
    const results: SecurityScenarioResult[] = [];

    for (const scenario of scenarios) {
      if (this.options.mode === "dry-run") {
        results.push(this.runDryScenario(scenario));
      } else {
        results.push(await this.runLiveScenario(scenario));
      }
    }

    const completedAt = new Date();

    return {
      runId: nanoid(10),
      target: {
        appName: this.options.targetConfig.appName,
        profileName: this.options.profileName,
        apiBaseUrl: this.options.targetConfig.apiBaseUrl,
        testMode: this.options.targetConfig.testMode
      },
      mode: this.options.mode,
      summary: summarize(results),
      scenarios: results,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime()
    };
  }

  private runDryScenario(scenario: SecurityScenario): SecurityScenarioResult {
    const startedAt = Date.now();
    const validationError = validateScenario(scenario);

    return {
      scenarioId: scenario.id,
      name: scenario.name,
      module: scenario.module,
      severity: scenario.severity,
      tags: scenario.tags,
      method: scenario.method,
      path: scenario.path,
      role: scenario.role,
      expectedStatus: scenario.expectedStatus,
      status: validationError ? "failed" : "passed",
      mode: "dry-run",
      durationMs: Date.now() - startedAt,
      message: validationError ?? "Dry-run passed. Scenario config is valid.",
      error: validationError
    };
  }

  private async runLiveScenario(scenario: SecurityScenario): Promise<SecurityScenarioResult> {
    const startedAt = Date.now();

    try {
      const connector = new HttpApiConnector({
        baseURL: this.options.targetConfig.apiBaseUrl,
        timeoutMs: this.options.targetConfig.timeoutMs
      });

      const response = await connector.request({
        method: scenario.method,
        path: scenario.path,
        headers: createAuthHeaders(this.options.targetConfig, scenario.role)
      });

      const passed = response.status === scenario.expectedStatus;

      return {
        scenarioId: scenario.id,
        name: scenario.name,
        module: scenario.module,
        severity: scenario.severity,
        tags: scenario.tags,
        method: scenario.method,
        path: scenario.path,
        role: scenario.role,
        expectedStatus: scenario.expectedStatus,
        actualStatus: response.status,
        status: passed ? "passed" : "failed",
        mode: "live",
        durationMs: Date.now() - startedAt,
        message: passed
          ? "Security expectation matched."
          : `Expected HTTP ${scenario.expectedStatus}, got HTTP ${response.status}.`,
        error: response.error
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        scenarioId: scenario.id,
        name: scenario.name,
        module: scenario.module,
        severity: scenario.severity,
        tags: scenario.tags,
        method: scenario.method,
        path: scenario.path,
        role: scenario.role,
        expectedStatus: scenario.expectedStatus,
        status: "failed",
        mode: "live",
        durationMs: Date.now() - startedAt,
        message: "Live security scenario failed to execute.",
        error: message
      };
    }
  }
}

function validateScenario(scenario: SecurityScenario): string | undefined {
  if (!scenario.path.startsWith("/")) {
    return "Security scenario path must start with '/'.";
  }

  if (scenario.expectedStatus < 100 || scenario.expectedStatus > 599) {
    return "Expected status must be a valid HTTP status code.";
  }

  if (!scenario.role) {
    return "Security scenario role is required.";
  }

  return undefined;
}

function summarize(results: SecurityScenarioResult[]): SecurityRunSummary {
  const summary: SecurityRunSummary = {
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
