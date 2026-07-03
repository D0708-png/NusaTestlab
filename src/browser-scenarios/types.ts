export type BrowserScenarioStepType =
  | "goto"
  | "click"
  | "fill"
  | "expect-text"
  | "expect-url"
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
  valueFromEnv?: string;
  text?: string;
  name?: string;
  expectedStatus?: number;
  timeoutMs?: number;
  waitAfterMs?: number;
  maxLinks?: number;
  enabled?: boolean;
}

export interface BrowserScenarioConfig {
  id: string;
  name: string;
  description?: string;
  baseUrl: string;
  viewport?: BrowserScenarioViewport;
  maxLinks?: number;
  continueOnFailure?: boolean;
  steps: BrowserScenarioStep[];
}

export type BrowserScenarioStatus = "passed" | "warning" | "failed";
export type BrowserScenarioStepStatus = "passed" | "failed" | "skipped";
export type BrowserScenarioIssueSeverity = "low" | "medium" | "high";

export interface BrowserScenarioIssue {
  severity: BrowserScenarioIssueSeverity;
  type: string;
  message: string;
  source?: string;
}

export interface BrowserScenarioLinkCheckResult {
  url: string;
  status: "passed" | "failed";
  statusCode?: number;
  error?: string;
}

export interface BrowserScenarioStepResult {
  id: string;
  type: BrowserScenarioStepType;
  status: BrowserScenarioStepStatus;
  durationMs: number;
  message: string;
}

export interface BrowserScenarioSummary {
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  consoleErrors: number;
  pageErrors: number;
  failedRequests: number;
  checkedLinks: number;
  brokenLinks: number;
}

export interface BrowserScenarioRunResult {
  linkChecks: BrowserScenarioLinkCheckResult[];
  scenarioId: string;
  scenarioName: string;
  baseUrl: string;
  status: BrowserScenarioStatus;
  riskScore: number;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  summary: BrowserScenarioSummary;
  steps: BrowserScenarioStepResult[];
  issues: BrowserScenarioIssue[];
  links: BrowserScenarioLinkCheckResult[];
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  screenshotPaths: string[];
}
