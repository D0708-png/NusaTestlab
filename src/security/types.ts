import type { HttpMethod } from "../connectors/http-api/types.js";

export type SecurityTestStatus = "passed" | "failed" | "warning" | "skipped";
export type SecurityTestMode = "dry-run" | "live";
export type SecuritySeverity = "low" | "medium" | "high" | "critical";

export interface SecurityScenario {
  id: string;
  name: string;
  module: string;
  severity: SecuritySeverity;
  tags: string[];
  method: HttpMethod;
  path: string;
  role: string;
  expectedStatus: number;
  description?: string;
}

export interface SecurityScenarioResult {
  scenarioId: string;
  name: string;
  module: string;
  severity: SecuritySeverity;
  tags: string[];
  method: HttpMethod;
  path: string;
  role: string;
  expectedStatus: number;
  actualStatus?: number;
  status: SecurityTestStatus;
  mode: SecurityTestMode;
  durationMs: number;
  message?: string;
  error?: string;
}

export interface SecurityRunSummary {
  total: number;
  passed: number;
  failed: number;
  warning: number;
  skipped: number;
}

export interface SecurityRunResult {
  runId: string;
  target: {
    appName: string;
    profileName: string;
    apiBaseUrl: string;
    testMode: boolean;
  };
  mode: SecurityTestMode;
  summary: SecurityRunSummary;
  scenarios: SecurityScenarioResult[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
}
