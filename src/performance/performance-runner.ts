import { nanoid } from "nanoid";
import { HttpApiConnector } from "../connectors/http-api/http-api-connector.js";
import { createAuthHeaders, type TargetSaaSConfig } from "../config/target-config.js";
import { PerformanceScenarioLoader } from "./performance-scenario-loader.js";
import type {
  PerformanceMode,
  PerformanceRunResult,
  PerformanceScenario,
  PerformanceScenarioMetrics,
  PerformanceScenarioResult
} from "./types.js";

interface PerformanceRunnerOptions {
  profileName: string;
  targetConfig: TargetSaaSConfig;
  mode: PerformanceMode;
}

interface RequestResult {
  status: number;
  durationMs: number;
  ok: boolean;
  error?: string;
}

export class PerformanceRunner {
  private readonly loader = new PerformanceScenarioLoader();

  constructor(private readonly options: PerformanceRunnerOptions) {}

  async run(): Promise<PerformanceRunResult> {
    const startedAt = new Date();
    const scenarios = await this.loader.load(this.options.profileName);
    const results: PerformanceScenarioResult[] = [];

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
        apiBaseUrl: this.options.targetConfig.apiBaseUrl
      },
      mode: this.options.mode,
      summary: summarize(results),
      scenarios: results,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime()
    };
  }

  private runDryScenario(scenario: PerformanceScenario): PerformanceScenarioResult {
    const startedAt = Date.now();
    const errors = validateScenario(scenario);

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
      status: errors.length > 0 ? "failed" : "passed",
      mode: "dry-run",
      durationMs: Date.now() - startedAt,
      message:
        errors.length > 0
          ? "Performance scenario config has validation errors."
          : "Dry-run passed. Performance scenario config is valid.",
      errors
    };
  }

  private async runLiveScenario(scenario: PerformanceScenario): Promise<PerformanceScenarioResult> {
    const startedAt = Date.now();
    const errors = validateScenario(scenario);

    if (errors.length > 0) {
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
        message: "Performance scenario config has validation errors.",
        errors
      };
    }

    const connector = new HttpApiConnector({
      baseURL: this.options.targetConfig.apiBaseUrl,
      timeoutMs: this.options.targetConfig.timeoutMs
    });

    const targetConfig = this.options.targetConfig;
    const requestResults: RequestResult[] = [];
    let nextRequestIndex = 0;

    const worker = async (): Promise<void> => {
      while (nextRequestIndex < scenario.requests) {
        nextRequestIndex += 1;

        const response = await connector.request({
          method: scenario.method,
          path: scenario.path,
          headers: createAuthHeaders(targetConfig, scenario.role)
        });

        requestResults.push({
          status: response.status,
          durationMs: response.durationMs,
          ok: response.status === scenario.expectedStatus,
          error: response.error
        });
      }
    };

    const workerCount = Math.min(scenario.concurrency, scenario.requests);
    const workers = Array.from({ length: workerCount }, () => worker());

    await Promise.all(workers);

    const metrics = calculateMetrics(requestResults);
    const thresholdErrors = evaluateThresholds(scenario, metrics);
    const status = thresholdErrors.length > 0 ? "failed" : "passed";

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
      status,
      mode: "live",
      metrics,
      durationMs: Date.now() - startedAt,
      message:
        status === "passed"
          ? "Performance scenario passed thresholds."
          : "Performance scenario failed thresholds.",
      errors: [
        ...requestResults
          .filter((result) => result.error)
          .slice(0, 5)
          .map((result) => result.error ?? "Unknown request error"),
        ...thresholdErrors
      ]
    };
  }
}

function validateScenario(scenario: PerformanceScenario): string[] {
  const errors: string[] = [];

  if (!scenario.path.startsWith("/")) {
    errors.push("path must start with '/'.");
  }

  if (scenario.concurrency > scenario.requests) {
    errors.push("concurrency should not be greater than requests.");
  }

  if (scenario.requests > 10000) {
    errors.push("requests is too high for the built-in runner. Use 10000 or less.");
  }

  return errors;
}

function calculateMetrics(results: RequestResult[]): PerformanceScenarioMetrics {
  const durations = results.map((result) => result.durationMs).sort((a, b) => a - b);
  const totalRequests = results.length;
  const successfulRequests = results.filter((result) => result.ok).length;
  const failedRequests = totalRequests - successfulRequests;
  const averageMs =
    totalRequests === 0
      ? 0
      : Math.round(durations.reduce((total, duration) => total + duration, 0) / totalRequests);

  const p95Index = Math.max(0, Math.ceil(totalRequests * 0.95) - 1);

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    errorRate: totalRequests === 0 ? 1 : failedRequests / totalRequests,
    minMs: durations[0] ?? 0,
    maxMs: durations[durations.length - 1] ?? 0,
    averageMs,
    p95Ms: durations[p95Index] ?? 0
  };
}

function evaluateThresholds(
  scenario: PerformanceScenario,
  metrics: PerformanceScenarioMetrics
): string[] {
  const errors: string[] = [];

  if (scenario.maxAverageMs !== undefined && metrics.averageMs > scenario.maxAverageMs) {
    errors.push(`Average latency ${metrics.averageMs}ms exceeded ${scenario.maxAverageMs}ms.`);
  }

  if (scenario.maxP95Ms !== undefined && metrics.p95Ms > scenario.maxP95Ms) {
    errors.push(`P95 latency ${metrics.p95Ms}ms exceeded ${scenario.maxP95Ms}ms.`);
  }

  if (scenario.maxErrorRate !== undefined && metrics.errorRate > scenario.maxErrorRate) {
    errors.push(`Error rate ${metrics.errorRate} exceeded ${scenario.maxErrorRate}.`);
  }

  return errors;
}

function summarize(results: PerformanceScenarioResult[]): PerformanceRunResult["summary"] {
  const summary = {
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
