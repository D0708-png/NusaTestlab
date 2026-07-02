import fs from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import { chromium, type Browser, type Page, type Response } from "playwright";
import type {
  BrowserScenarioConfig,
  BrowserScenarioIssue,
  BrowserScenarioLinkCheckResult,
  BrowserScenarioRunResult,
  BrowserScenarioStep,
  BrowserScenarioStepResult,
  BrowserScenarioViewport
} from "./types.js";

export interface BrowserScenarioRunnerOptions {
  screenshotDir?: string;
  headless?: boolean;
}

interface RuntimeState {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  linkChecks: BrowserScenarioLinkCheckResult[];
  issues: BrowserScenarioIssue[];
}

export class BrowserScenarioRunner {
  constructor(private readonly options: BrowserScenarioRunnerOptions = {}) {}

  async run(scenario: BrowserScenarioConfig): Promise<BrowserScenarioRunResult> {
    const startedAtDate = new Date();
    const startedAt = Date.now();
    const viewport: BrowserScenarioViewport = scenario.viewport ?? { width: 1365, height: 768 };
    const screenshotDir = this.options.screenshotDir ?? path.join(process.cwd(), "results", "browser-scenario-screenshots");

    await fs.mkdir(screenshotDir, { recursive: true });

    const state: RuntimeState = {
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
      linkChecks: [],
      issues: []
    };

    const browser = await chromium.launch({ headless: this.options.headless ?? true });
    const page = await this.createPage(browser, viewport, state);
    const stepResults: BrowserScenarioStepResult[] = [];

    try {
      for (const step of scenario.steps) {
        const result = await this.runStep(page, scenario, step, screenshotDir, state);
        stepResults.push(result);

        if (result.status === "failed") {
          state.issues.push({
            severity: "high",
            type: "step-failure",
            message: result.error ?? result.message,
            source: step.id
          });

          if (!scenario.continueOnFailure) {
            const remaining = scenario.steps.slice(scenario.steps.indexOf(step) + 1);
            for (const skipped of remaining) {
              stepResults.push({
                id: skipped.id,
                type: skipped.type,
                status: "skipped",
                durationMs: 0,
                message: "Skipped because previous step failed."
              });
            }
            break;
          }
        }
      }
    } finally {
      await browser.close();
    }

    for (const message of state.consoleErrors) {
      state.issues.push({ severity: "medium", type: "console-error", message });
    }

    for (const message of state.pageErrors) {
      state.issues.push({ severity: "high", type: "page-error", message });
    }

    for (const message of state.failedRequests) {
      state.issues.push({ severity: "medium", type: "failed-request", message });
    }

    for (const link of state.linkChecks.filter((item) => item.status === "failed")) {
      state.issues.push({
        severity: "medium",
        type: "broken-link",
        message: link.error ?? `Broken link: ${link.url}`,
        source: link.url
      });
    }

    const completedAtDate = new Date();
    const failedSteps = stepResults.filter((item) => item.status === "failed").length;
    const skippedSteps = stepResults.filter((item) => item.status === "skipped").length;
    const brokenLinks = state.linkChecks.filter((item) => item.status === "failed").length;
    const riskScore = calculateRiskScore({
      failedSteps,
      skippedSteps,
      consoleErrors: state.consoleErrors.length,
      pageErrors: state.pageErrors.length,
      failedRequests: state.failedRequests.length,
      brokenLinks
    });

    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      baseUrl: scenario.baseUrl,
      finalUrl: undefined,
      status: failedSteps > 0 ? "failed" : riskScore > 0 ? "warning" : "passed",
      riskScore,
      startedAt: startedAtDate.toISOString(),
      completedAt: completedAtDate.toISOString(),
      durationMs: Date.now() - startedAt,
      viewport,
      summary: {
        totalSteps: stepResults.length,
        passedSteps: stepResults.filter((item) => item.status === "passed").length,
        failedSteps,
        skippedSteps,
        consoleErrors: state.consoleErrors.length,
        pageErrors: state.pageErrors.length,
        failedRequests: state.failedRequests.length,
        checkedLinks: state.linkChecks.length,
        brokenLinks
      },
      steps: stepResults,
      issues: state.issues,
      linkChecks: state.linkChecks
    };
  }

  private async createPage(browser: Browser, viewport: BrowserScenarioViewport, state: RuntimeState): Promise<Page> {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    page.on("console", (message) => {
      if (message.type() === "error") {
        state.consoleErrors.push(message.text());
      }
    });

    page.on("pageerror", (error) => {
      state.pageErrors.push(error.message);
    });

    page.on("requestfailed", (request) => {
      state.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? "failed"}`);
    });

    return page;
  }

  private async runStep(
    page: Page,
    scenario: BrowserScenarioConfig,
    step: BrowserScenarioStep,
    screenshotDir: string,
    state: RuntimeState
  ): Promise<BrowserScenarioStepResult> {
    const startedAt = Date.now();

    try {
      if (step.type === "goto") {
        const url = resolveUrl(scenario.baseUrl, step.url ?? step.path ?? "/");
        const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: step.timeoutMs ?? 30000 });
        validateResponse(step, response);
        return passed(step, startedAt, `Opened ${url}`);
      }

      if (step.type === "click") {
        await page.locator(step.selector!).click({ timeout: step.timeoutMs ?? 10000 });
        return passed(step, startedAt, `Clicked ${step.selector}`);
      }

      if (step.type === "fill") {
        await page.locator(step.selector!).fill(step.value ?? "", { timeout: step.timeoutMs ?? 10000 });
        return passed(step, startedAt, `Filled ${step.selector}`);
      }

      if (step.type === "expect-text") {
        const content = await page.textContent("body");
        if (!content?.includes(step.text ?? "")) {
          throw new Error(`Expected text not found: ${step.text}`);
        }
        return passed(step, startedAt, `Found expected text: ${step.text}`);
      }

      if (step.type === "wait-for-selector") {
        await page.locator(step.selector!).waitFor({ timeout: step.timeoutMs ?? 10000 });
        return passed(step, startedAt, `Selector appeared: ${step.selector}`);
      }

      if (step.type === "check-links") {
        const links = await collectLinks(page, scenario.baseUrl, step.maxLinks ?? scenario.maxLinks ?? 10);
        const results = await checkLinks(page, links);
        state.linkChecks.push(...results);
        const broken = results.filter((item) => item.status === "failed").length;
        if (broken > 0) {
          throw new Error(`${broken} broken link(s) found.`);
        }
        return passed(step, startedAt, `Checked ${results.length} link(s).`);
      }

      if (step.type === "screenshot") {
        const screenshotPath = path.join(
          screenshotDir,
          `${dayjs().format("YYYY-MM-DD-HHmmss")}-${safeName(step.name ?? step.id)}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: true });
        return {
          ...passed(step, startedAt, `Screenshot captured: ${screenshotPath}`),
          screenshotPath
        };
      }

      throw new Error(`Unsupported browser scenario step type: ${step.type}`);
    } catch (error) {
      const screenshotPath = path.join(
        screenshotDir,
        `${dayjs().format("YYYY-MM-DD-HHmmss")}-${safeName(step.id)}-failed.png`
      );

      try {
        await page.screenshot({ path: screenshotPath, fullPage: true });
      } catch {
        // Ignore screenshot failure.
      }

      return {
        id: step.id,
        type: step.type,
        status: "failed",
        durationMs: Date.now() - startedAt,
        message: "Step failed.",
        error: error instanceof Error ? error.message : String(error),
        screenshotPath
      };
    }
  }
}

function passed(step: BrowserScenarioStep, startedAt: number, message: string): BrowserScenarioStepResult {
  return {
    id: step.id,
    type: step.type,
    status: "passed",
    durationMs: Date.now() - startedAt,
    message
  };
}

function validateResponse(step: BrowserScenarioStep, response: Response | null): void {
  if (!response) {
    throw new Error("Navigation did not return a response.");
  }

  if (step.expectedStatus && response.status() !== step.expectedStatus) {
    throw new Error(`Expected status ${step.expectedStatus}, received ${response.status()}.`);
  }

  if (!response.ok() && !step.expectedStatus) {
    throw new Error(`Navigation returned HTTP ${response.status()}.`);
  }
}

async function collectLinks(page: Page, baseUrl: string, maxLinks: number): Promise<string[]> {
  const links = await page.locator("a[href]").evaluateAll((anchors) =>
    anchors
      .map((anchor) => (anchor as HTMLAnchorElement).href)
      .filter(Boolean)
  );

  return Array.from(new Set(links))
    .filter((url) => url.startsWith("http"))
    .filter((url) => isSameOriginOrPublic(baseUrl, url))
    .slice(0, maxLinks);
}

async function checkLinks(page: Page, links: string[]): Promise<BrowserScenarioLinkCheckResult[]> {
  const results: BrowserScenarioLinkCheckResult[] = [];

  for (const url of links) {
    try {
      const response = await page.request.get(url, { timeout: 15000 });
      results.push({
        url,
        status: response.ok() ? "passed" : "failed",
        statusCode: response.status(),
        error: response.ok() ? undefined : `HTTP ${response.status()}`
      });
    } catch (error) {
      results.push({
        url,
        status: "failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return results;
}

function resolveUrl(baseUrl: string, value: string): string {
  if (/^https?:\/\//.test(value)) {
    return value;
  }

  return new URL(value, baseUrl).toString();
}

function isSameOriginOrPublic(baseUrl: string, url: string): boolean {
  try {
    return new URL(baseUrl).origin === new URL(url).origin || new URL(url).hostname === "example.com";
  } catch {
    return false;
  }
}

function safeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") || "screenshot";
}

function calculateRiskScore(input: {
  failedSteps: number;
  skippedSteps: number;
  consoleErrors: number;
  pageErrors: number;
  failedRequests: number;
  brokenLinks: number;
}): number {
  return Math.min(
    100,
    input.failedSteps * 25 +
      input.skippedSteps * 5 +
      input.pageErrors * 20 +
      input.consoleErrors * 8 +
      input.failedRequests * 5 +
      input.brokenLinks * 10
  );
}
