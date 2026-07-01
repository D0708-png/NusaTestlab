export type TestSuiteMode = "dry-run" | "live";

export type TestSuiteTaskType =
  | "core"
  | "inventory-validation"
  | "report-validation"
  | "security"
  | "performance"
  | "dashboard-build"
  | "dashboard-compare";

export interface TestSuiteTask {
  id: string;
  type: TestSuiteTaskType;
  enabled: boolean;
  continueOnFailure?: boolean;
}

export interface TestSuiteConfig {
  id: string;
  name: string;
  description?: string;
  profile: string;
  mode: TestSuiteMode;
  tasks: TestSuiteTask[];
}

export type TestSuiteTaskStatus = "passed" | "failed" | "skipped";

export interface TestSuiteTaskResult {
  id: string;
  type: TestSuiteTaskType;
  status: TestSuiteTaskStatus;
  durationMs: number;
  message: string;
  error?: string;
}

export interface TestSuiteRunResult {
  suiteId: string;
  suiteName: string;
  profile: string;
  mode: TestSuiteMode;
  status: "passed" | "failed";
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  tasks: TestSuiteTaskResult[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
}
