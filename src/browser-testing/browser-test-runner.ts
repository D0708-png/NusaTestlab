import fs from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import { chromium } from "playwright";
import type {
  BrowserIssue,
  BrowserLinkCheckResult,
  BrowserTestOptions,
  BrowserTestResult,
  BrowserTestStatus
} from "./types.js";

export class BrowserTestRunner {
  async run(options: BrowserTestOptions): Promise<BrowserTestResult> {
    const startedAtDate = new Date();
    const startedAt = Date.now();
    const issues: BrowserIssue[] = [];
    const consoleErrors: BrowserIssue[] = [];
    const pageErrors: BrowserIssue[] = [];
    const failedRequests: BrowserIssue[] = [];
    const linkChecks: BrowserLinkCheckResult[] = [];

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: options.viewport });

    page.setDefaultTimeout(options.timeoutMs);
    page.setDefaultNavigationTimeout(options.timeoutMs);

    page.on("console", (message) => {
      if (message.type() !== "error") {
        return;
      }

      const issue = createIssue({
        category: "console",
        severity: "medium",
        message: "Browser console error detected.",
        detail: message.text()
      });

      consoleErrors.push(issue);
      issues.push(issue);
    });

    page.on("pageerror", (error) => {
      const issue = createIssue({
        category: "page-error",
        severity: "high",
        message: "Uncaught browser page error detected.",
        detail: error.message
      });

      pageErrors.push(issue);
      issues.push(issue);
    });

    page.on("requestfailed", (request) => {
      const issue = createIssue({
        category: "request",
        severity: "high",
        message: "Network request failed.",
        url: request.url(),
        detail: request.failure()?.errorText ?? "Unknown request failure."
      });

      failedRequests.push(issue);
      issues.push(issue);
    });

    page.on("response", (response) => {
      const status = response.status();

      if (status < 400 || response.url().startsWith("data:")) {
        return;
      }

      const issue = createIssue({
        category: "request",
        severity: status >= 500 ? "high" : "medium",
        message: `HTTP ${status} response detected.`,
        url: response.url()
      });

      failedRequests.push(issue);
      issues.push(issue);
    });

    let finalUrl = options.url;
    let screenshotPath: string | undefined;

    try {
      const response = await page.goto(options.url, {
        waitUntil: "domcontentloaded",
        timeout: options.timeoutMs
      });

      finalUrl = page.url();

      if (!response) {
        issues.push(
          createIssue({
            category: "page-load",
            severity: "critical",
            message: "Page did not return a navigation response.",
            url: options.url
          })
        );
      } else if (response.status() >= 400) {
        issues.push(
          createIssue({
            category: "page-load",
            severity: "critical",
            message: `Main page returned HTTP ${response.status()}.`,
            url: response.url()
          })
        );
      }

      await page.waitForLoadState("load", { timeout: Math.min(options.timeoutMs, 15000) }).catch(() => undefined);

      const screenshotDir = path.join(options.outputDir, "browser-screenshots");
      await fs.mkdir(screenshotDir, { recursive: true });
      screenshotPath = path.join(
        screenshotDir,
        `${dayjs(startedAtDate).format("YYYY-MM-DD-HHmmss")}-screenshot.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const links = await collectLinks(page, finalUrl, options.includeExternal, options.maxLinks);

      for (const link of links) {
        const result = await checkLink(page, link, options.timeoutMs);
        linkChecks.push(result);

        if (result.status === "failed") {
          issues.push(
            createIssue({
              category: "link",
              severity: "medium",
              message: result.statusCode ? `Broken link returned HTTP ${result.statusCode}.` : "Broken link check failed.",
              url: result.url,
              detail: result.error
            })
          );
        }
      }
    } catch (error) {
      issues.push(
        createIssue({
          category: "page-load",
          severity: "critical",
          message: "Failed to load target page.",
          url: options.url,
          detail: error instanceof Error ? error.message : String(error)
        })
      );
    } finally {
      await page.close().catch(() => undefined);
      await browser.close().catch(() => undefined);
    }

    const riskScore = calculateRiskScore(issues);
    const status = resolveStatus(issues);
    const completedAtDate = new Date();

    return {
      targetUrl: options.url,
      finalUrl,
      status,
      riskScore,
      startedAt: startedAtDate.toISOString(),
      completedAt: completedAtDate.toISOString(),
      durationMs: Date.now() - startedAt,
      viewport: options.viewport,
      summary: {
        issues: issues.length,
        consoleErrors: consoleErrors.length,
        pageErrors: pageErrors.length,
        failedRequests: failedRequests.length,
        linksChecked: linkChecks.filter((item) => item.status !== "skipped").length,
        brokenLinks: linkChecks.filter((item) => item.status === "failed").length
      },
      screenshotPath,
      issues: dedupeIssues(issues),
      consoleErrors: dedupeIssues(consoleErrors),
      pageErrors: dedupeIssues(pageErrors),
      failedRequests: dedupeIssues(failedRequests),
      linkChecks
    };
  }
}

async function collectLinks(
  page: import("playwright").Page,
  finalUrl: string,
  includeExternal: boolean,
  maxLinks: number
): Promise<string[]> {
  const baseUrl = new URL(finalUrl);
  const links = await page.$$eval("a[href]", (anchors) =>
    Array.from(new Set(anchors.map((anchor) => (anchor as HTMLAnchorElement).href).filter(Boolean)))
  );

  return links
    .filter((link) => link.startsWith("http://") || link.startsWith("https://"))
    .filter((link) => includeExternal || new URL(link).origin === baseUrl.origin)
    .slice(0, maxLinks);
}

async function checkLink(
  page: import("playwright").Page,
  url: string,
  timeoutMs: number
): Promise<BrowserLinkCheckResult> {
  try {
    const response = await page.request.get(url, {
      timeout: Math.min(timeoutMs, 10000),
      failOnStatusCode: false
    });

    const statusCode = response.status();

    return {
      url,
      status: statusCode >= 400 ? "failed" : "passed",
      statusCode
    };
  } catch (error) {
    return {
      url,
      status: "failed",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function createIssue(input: Omit<BrowserIssue, "id">): BrowserIssue {
  return {
    id: `${input.category}-${Math.random().toString(36).slice(2, 10)}`,
    ...input
  };
}

function calculateRiskScore(issues: BrowserIssue[]): number {
  const score = issues.reduce((total, issue) => {
    if (issue.severity === "critical") return total + 40;
    if (issue.severity === "high") return total + 25;
    if (issue.severity === "medium") return total + 10;
    return total + 5;
  }, 0);

  return Math.min(score, 100);
}

function resolveStatus(issues: BrowserIssue[]): BrowserTestStatus {
  if (issues.some((issue) => issue.severity === "critical")) {
    return "failed";
  }

  if (issues.length > 0) {
    return "warning";
  }

  return "passed";
}

function dedupeIssues<T extends BrowserIssue>(issues: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const issue of issues) {
    const key = `${issue.category}:${issue.message}:${issue.url ?? ""}:${issue.detail ?? ""}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(issue);
  }

  return result;
}
