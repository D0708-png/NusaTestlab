export type AiTestMode = "dry-run" | "live";
export type AiTestStatus = "passed" | "failed" | "warning" | "skipped";
export type AiSeverity = "low" | "medium" | "high" | "critical";

export interface AiScenario {
  id: string;
  name: string;
  module: string;
  severity: AiSeverity;
  tags: string[];
  role: string;
  prompt: string;
  endpointPath: string;
  expectedContains?: string[];
  forbiddenContains?: string[];
  forbiddenPatterns?: string[];
  expectedStatus?: number;
  expectedRefusal?: boolean;
  description?: string;
}

export interface AiScenarioResult {
  scenarioId: string;
  name: string;
  module: string;
  severity: AiSeverity;
  tags: string[];
  role: string;
  prompt: string;
  endpointPath: string;
  status: AiTestStatus;
  mode: AiTestMode;
  expectedStatus?: number;
  actualStatus?: number;
  responseText?: string;
  durationMs: number;
  message?: string;
  errors: string[];
}

export interface AiRunResult {
  runId: string;
  target: {
    appName: string;
    profileName: string;
    apiBaseUrl: string;
  };
  mode: AiTestMode;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warning: number;
    skipped: number;
  };
  scenarios: AiScenarioResult[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
}
