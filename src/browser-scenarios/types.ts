export type BrowserScenarioStepType =
  | "goto"
  | "click"
  | "fill"
  | "expect-text"
  | "wait-for-selector"
  | "check-links"
  | "screenshot";

export interface BrowserScenarioViewport {
  width: number;
  height: number;
}

export interface BrowserScenarioStep {
  id: string;
  type: BrowserScenarioStepType;
  path?: string;
  url?: string;
  selector?: string;
  value?: string;
  text?: string;
  name?: string;
  expectedStatus?: number;
  timeoutMs?: number;
  maxLinks?: number;
}

export interface BrowserScenarioConfig {
  id: string;
  name: string;
  baseUrl: string;
  viewport?: BrowserScenarioViewport;
  maxLinks?: number;
  continueOnFailure?: boolean;
  steps: BrowserScenarioStep[];
}

export type BrowserScenarioStepStatus = "passed" | "failed" | "skipped";

export interface BrowserScenarioStepResult {
  id: string;
  type: BrowserScenarioStepType;
  status: BrowserScenarioStepStatus;
  durationMs: number;
  message: string;
  error?: string;
  screenshotPath?: string;
}

export interface BrowserScenarioIssue {
  severity: "low" | "medium" | "high";
  type:
    | "step-failure"
    | "console-error"
    | "page-error"
    | "failed-request"
    | "broken-link";
  message: string;
  source?: string;
}

export interface BrowserScenarioLinkCheckResult {
  url: string;
  status: "passed" | "failed" | "skipped";
  statusCode?: number;
  error?: string;
}

export interface BrowserScenarioRunResult {
  scenarioId: string;
  scenarioName: string;
  baseUrl: string;
  finalUrl?: string;
  status: "passed" | "warning" | "failed";
  riskScore: number;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  viewport: BrowserScenarioViewport;
  summary: {
    totalSteps: number;
    passedSteps: number;
    failedSteps: number;
    skippedSteps: number;
    consoleErrors: number;
    pageErrors: number;
    failedRequests: number;
    checkedLinks: number;
    brokenLinks: number;
  };
  steps: BrowserScenarioStepResult[];
  issues: BrowserScenarioIssue[];
  linkChecks: BrowserScenarioLinkCheckResult[];
}
