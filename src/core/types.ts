export type TestStatus = "passed" | "failed" | "warning" | "skipped";

export type AssertionOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "isTrue"
  | "isFalse"
  | "exists"
  | "notExists"
  | "matchesRegex";

export type ScenarioSeverity = "low" | "medium" | "high" | "critical";

export interface AssertionStep {
  id: string;
  name: string;
  type: "assertion";
  operator: AssertionOperator;
  actual: unknown;
  expected?: unknown;
  message?: string;
}

export type ScenarioStep = AssertionStep;

export interface TestScenario {
  id: string;
  name: string;
  module: string;
  severity: ScenarioSeverity;
  tags: string[];
  steps: ScenarioStep[];
}

export interface TestStepResult {
  stepId: string;
  name: string;
  type: ScenarioStep["type"];
  status: TestStatus;
  operator?: AssertionOperator;
  expected?: unknown;
  actual?: unknown;
  message?: string;
  error?: string;
  durationMs: number;
}

export interface TestScenarioResult {
  scenarioId: string;
  name: string;
  module: string;
  severity: ScenarioSeverity;
  tags: string[];
  status: TestStatus;
  steps: TestStepResult[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

export interface TestRunSummary {
  total: number;
  passed: number;
  failed: number;
  warning: number;
  skipped: number;
}

export interface TestTargetSummary {
  appName: string;
  profileName: string;
  apiBaseUrl: string;
  testMode: boolean;
  tenantId?: string;
  storeId?: string;
}

export interface TestRunResult {
  runId: string;
  target: TestTargetSummary;
  profileName: string;
  summary: TestRunSummary;
  scenarios: TestScenarioResult[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
}
