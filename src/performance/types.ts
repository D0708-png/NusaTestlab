import type { HttpMethod } from "../connectors/http-api/types.js";

export type PerformanceMode = "dry-run" | "live";
export type PerformanceStatus = "passed" | "failed" | "warning" | "skipped";
export type PerformanceSeverity = "low" | "medium" | "high" | "critical";

export interface PerformanceScenario {
  id: string;
  name: string;
  module: string;
  severity: PerformanceSeverity;
  tags: string[];
  method: HttpMethod;
  path: string;
  role: string;
  expectedStatus: number;
  requests: number;
  concurrency: number;
  maxAverageMs?: number;
  maxP95Ms?: number;
  maxErrorRate?: number;
  description?: string;
}

export interface PerformanceScenarioMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  minMs: number;
  maxMs: number;
  averageMs: number;
  p95Ms: number;
}

export interface PerformanceScenarioResult {
  scenarioId: string;
  name: string;
  module: string;
  severity: PerformanceSeverity;
  tags: string[];
  method: HttpMethod;
  path: string;
  role: string;
  expectedStatus: number;
  status: PerformanceStatus;
  mode: PerformanceMode;
  metrics?: PerformanceScenarioMetrics;
  durationMs: number;
  message?: string;
  errors: string[];
}

export interface PerformanceRunResult {
  runId: string;
  target: {
    appName: string;
    profileName: string;
    apiBaseUrl: string;
  };
  mode: PerformanceMode;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warning: number;
    skipped: number;
  };
  scenarios: PerformanceScenarioResult[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
}
