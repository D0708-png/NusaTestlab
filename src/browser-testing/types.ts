export type BrowserTestStatus = "passed" | "warning" | "failed";
export type BrowserIssueSeverity = "low" | "medium" | "high" | "critical";
export type BrowserIssueCategory = "page-load" | "console" | "page-error" | "request" | "link";

export interface BrowserTestOptions {
  url: string;
  outputDir: string;
  maxLinks: number;
  includeExternal: boolean;
  timeoutMs: number;
  viewport: {
    width: number;
    height: number;
  };
}

export interface BrowserIssue {
  id: string;
  category: BrowserIssueCategory;
  severity: BrowserIssueSeverity;
  message: string;
  url?: string;
  detail?: string;
}

export interface BrowserLinkCheckResult {
  url: string;
  status: "passed" | "failed" | "skipped";
  statusCode?: number;
  error?: string;
}

export interface BrowserTestResult {
  targetUrl: string;
  finalUrl: string;
  status: BrowserTestStatus;
  riskScore: number;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  viewport: {
    width: number;
    height: number;
  };
  summary: {
    issues: number;
    consoleErrors: number;
    pageErrors: number;
    failedRequests: number;
    linksChecked: number;
    brokenLinks: number;
  };
  screenshotPath?: string;
  issues: BrowserIssue[];
  consoleErrors: BrowserIssue[];
  pageErrors: BrowserIssue[];
  failedRequests: BrowserIssue[];
  linkChecks: BrowserLinkCheckResult[];
}
