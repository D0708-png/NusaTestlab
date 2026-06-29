import { nanoid } from "nanoid";
import { HttpApiConnector } from "../connectors/http-api/http-api-connector.js";
import { createAuthHeaders, type TargetSaaSConfig } from "../config/target-config.js";
import { AiScenarioLoader } from "./ai-scenario-loader.js";
import type { AiRunResult, AiScenario, AiScenarioResult, AiTestMode } from "./types.js";

interface AiTestRunnerOptions {
  profileName: string;
  targetConfig: TargetSaaSConfig;
  mode: AiTestMode;
}

export class AiTestRunner {
  private readonly loader = new AiScenarioLoader();

  constructor(private readonly options: AiTestRunnerOptions) {}

  async run(): Promise<AiRunResult> {
    const startedAt = new Date();
    const scenarios = await this.loader.load(this.options.profileName);
    const results: AiScenarioResult[] = [];

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

  private runDryScenario(scenario: AiScenario): AiScenarioResult {
    const startedAt = Date.now();
    const errors = validateScenarioConfig(scenario);

    return {
      scenarioId: scenario.id,
      name: scenario.name,
      module: scenario.module,
      severity: scenario.severity,
      tags: scenario.tags,
      role: scenario.role,
      prompt: scenario.prompt,
      endpointPath: scenario.endpointPath,
      status: errors.length > 0 ? "failed" : "passed",
      mode: "dry-run",
      expectedStatus: scenario.expectedStatus,
      durationMs: Date.now() - startedAt,
      message:
        errors.length > 0
          ? "AI scenario config has validation errors."
          : "Dry-run passed. AI scenario config is valid.",
      errors
    };
  }

  private async runLiveScenario(scenario: AiScenario): Promise<AiScenarioResult> {
    const startedAt = Date.now();
    const connector = new HttpApiConnector({
      baseURL: this.options.targetConfig.apiBaseUrl,
      timeoutMs: this.options.targetConfig.timeoutMs
    });

    try {
      const response = await connector.request({
        method: "POST",
        path: scenario.endpointPath,
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders(this.options.targetConfig, scenario.role)
        },
        body: {
          message: scenario.prompt,
          prompt: scenario.prompt
        }
      });

      const responseText = extractResponseText(response.data);
      const errors = evaluateAiResponse(scenario, response.status, responseText);
      const status = errors.length > 0 ? "failed" : "passed";

      return {
        scenarioId: scenario.id,
        name: scenario.name,
        module: scenario.module,
        severity: scenario.severity,
        tags: scenario.tags,
        role: scenario.role,
        prompt: scenario.prompt,
        endpointPath: scenario.endpointPath,
        status,
        mode: "live",
        expectedStatus: scenario.expectedStatus,
        actualStatus: response.status,
        responseText,
        durationMs: Date.now() - startedAt,
        message: status === "passed" ? "AI response matched expectations." : "AI response failed expectations.",
        errors
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        scenarioId: scenario.id,
        name: scenario.name,
        module: scenario.module,
        severity: scenario.severity,
        tags: scenario.tags,
        role: scenario.role,
        prompt: scenario.prompt,
        endpointPath: scenario.endpointPath,
        status: "failed",
        mode: "live",
        expectedStatus: scenario.expectedStatus,
        durationMs: Date.now() - startedAt,
        message: "AI live test failed to execute.",
        errors: [message]
      };
    }
  }
}

function validateScenarioConfig(scenario: AiScenario): string[] {
  const errors: string[] = [];

  if (!scenario.endpointPath.startsWith("/")) {
    errors.push("endpointPath must start with '/'.");
  }

  if (!scenario.prompt.trim()) {
    errors.push("prompt must not be empty.");
  }

  if (!scenario.expectedContains?.length && !scenario.forbiddenContains?.length && !scenario.expectedStatus) {
    errors.push("scenario should define expectedContains, forbiddenContains, or expectedStatus.");
  }

  return errors;
}

function evaluateAiResponse(scenario: AiScenario, statusCode: number, responseText: string): string[] {
  const errors: string[] = [];
  const normalizedResponse = responseText.toLowerCase();

  if (scenario.expectedStatus && statusCode !== scenario.expectedStatus) {
    errors.push(`Expected HTTP ${scenario.expectedStatus}, got HTTP ${statusCode}.`);
  }

  for (const expected of scenario.expectedContains ?? []) {
    if (!normalizedResponse.includes(expected.toLowerCase())) {
      errors.push(`Response does not contain expected text: ${expected}`);
    }
  }

  for (const forbidden of scenario.forbiddenContains ?? []) {
    if (normalizedResponse.includes(forbidden.toLowerCase())) {
      errors.push(`Response contains forbidden text: ${forbidden}`);
    }
  }

  return errors;
}

function extractResponseText(data: unknown): string {
  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    for (const key of ["answer", "message", "response", "text", "content"]) {
      if (typeof record[key] === "string") {
        return record[key] as string;
      }
    }

    return JSON.stringify(data);
  }

  return String(data ?? "");
}

function summarize(results: AiScenarioResult[]): AiRunResult["summary"] {
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
