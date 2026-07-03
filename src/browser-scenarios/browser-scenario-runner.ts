import fs from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import { chromium, type Page } from "playwright";
import type {
  BrowserScenarioConfig,
  BrowserScenarioIssue,
  BrowserScenarioLinkCheckResult,
  BrowserScenarioRunResult,
  BrowserScenarioStep,
  BrowserScenarioStepResult
} from "./types.js";

export interface BrowserScenarioRunnerOptions {
  screenshotDir?: string;
  headless?: boolean;
}

interface RuntimeState {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  links: BrowserScenarioLinkCheckResult[];
  issues: BrowserScenarioIssue[];
  linkChecks: BrowserScenarioLinkCheckResult[];
  screenshotPaths: string[];
}

export class BrowserScenarioRunner {
  constructor(private readonly options: BrowserScenarioRunnerOptions = {}) {}

  async run(scenario: BrowserScenarioConfig): Promise<BrowserScenarioRunResult> {
    const startedAt = new Date();
    const screenshotDir = this.options.screenshotDir ?? path.join("results", "browser-scenario-screenshots");
    await fs.mkdir(screenshotDir, { recursive: true });

    const state: RuntimeState = {
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
      links: [],
      issues: [],
      linkChecks: [],
      screenshotPaths: []
    };

    const browser = await chromium.launch({ headless: this.options.headless ?? true });
    const context = await browser.newContext({
      viewport: scenario.viewport ?? { width: 1365, height: 768 }
    });
    const page = await context.newPage();
    this.attachObservers(page, state);

    const steps: BrowserScenarioStepResult[] = [];
    let shouldSkip = false;

    try {
      for (const step of scenario.steps) {
        if (step.enabled === false) {
          steps.push({ id: step.id, type: step.type, status: "skipped", durationMs: 0, message: "Step disabled." });
          continue;
        }

        if (shouldSkip) {
          steps.push({ id: step.id, type: step.type, status: "skipped", durationMs: 0, message: "Skipped because previous step failed." });
          continue;
        }

        const started = Date.now();
        try {
          const message = await this.runStep(page, scenario, step, screenshotDir, state);
          steps.push({ id: step.id, type: step.type, status: "passed", durationMs: Date.now() - started, message });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          steps.push({ id: step.id, type: step.type, status: "failed", durationMs: Date.now() - started, message: "Step failed." });
          state.issues.push({ severity: "high", type: "step-failure", message, source: step.id });
          if (!scenario.continueOnFailure) {
            shouldSkip = true;
          }
        }
      }
    } finally {
      await context.close();
      await browser.close();
    }

    const completedAt = new Date();
    const failedSteps = steps.filter((step) => step.status === "failed").length;
    const skippedSteps = steps.filter((step) => step.status === "skipped").length;
    const brokenLinks = state.links.filter((link) => link.status === "failed").length;
    const riskScore = this.calculateRiskScore(failedSteps, skippedSteps, state, brokenLinks);
    const status = failedSteps > 0 ? "failed" : state.issues.length > 0 || brokenLinks > 0 ? "warning" : "passed";

    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      baseUrl: scenario.baseUrl,
      status,
      riskScore,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      summary: {
        totalSteps: steps.length,
        passedSteps: steps.filter((step) => step.status === "passed").length,
        failedSteps,
        skippedSteps,
        consoleErrors: state.consoleErrors.length,
        pageErrors: state.pageErrors.length,
        failedRequests: state.failedRequests.length,
        checkedLinks: state.links.length,
        brokenLinks
      },
      steps,
      issues: state.issues,
      linkChecks: state.linkChecks,
      links: state.links,
      consoleErrors: state.consoleErrors,
      pageErrors: state.pageErrors,
      failedRequests: state.failedRequests,
      screenshotPaths: state.screenshotPaths
    };
  }

  private attachObservers(page: Page, state: RuntimeState): void {
    page.on("console", (message) => {
      if (message.type() === "error") {
        state.consoleErrors.push(message.text());
      }
    });

    page.on("pageerror", (error) => {
      state.pageErrors.push(error.message);
    });

    page.on("response", (response) => {
      if (response.status() >= 400) {
        state.failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });
  }

  private async runStep(
    page: Page,
    scenario: BrowserScenarioConfig,
    step: BrowserScenarioStep,
    screenshotDir: string,
    state: RuntimeState
  ): Promise<string> {
    const timeout = step.timeoutMs ?? 10000;

    switch (step.type) {
      case "goto": {
        const targetUrl = step.url ?? this.resolveUrl(scenario.baseUrl, step.path);
        await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout });
        return `Opened ${targetUrl}`;
      }

      case "wait-for-selector": {
        if (!step.selector) throw new Error("wait-for-selector step requires selector.");
        await page.locator(step.selector).first().waitFor({ timeout });
        return `Selector found: ${step.selector}`;
      }

      case "fill": {
        if (!step.selector) throw new Error("fill step requires selector.");
        const value = this.resolveStepValue(step);
        await page.locator(step.selector).first().fill(value, { timeout });
        if (step.waitAfterMs) await page.waitForTimeout(step.waitAfterMs);
        return step.valueFromEnv ? `Filled ${step.selector} from env ${step.valueFromEnv}` : `Filled ${step.selector}`;
      }

      case "click": {
        if (step.selector) {
          await page.locator(step.selector).first().click({ timeout });
        } else if (step.text) {
          await page.getByText(step.text, { exact: false }).first().click({ timeout });
        } else {
          throw new Error("click step requires selector or text.");
        }
        if (step.waitAfterMs) await page.waitForTimeout(step.waitAfterMs);
        return step.selector ? `Clicked selector: ${step.selector}` : `Clicked text: ${step.text}`;
      }

      case "expect-text": {
        if (!step.text) throw new Error("expect-text step requires text.");
        await page.waitForLoadState("domcontentloaded", { timeout }).catch(() => undefined);
        const bodyText = await page.locator("body").innerText({ timeout });
        if (!bodyText.includes(step.text)) {
          throw new Error(`Expected text not found: ${step.text}`);
        }
        return `Expected text found: ${step.text}`;
      }

      case "expect-url": {
        const expected = step.url ?? step.path ?? step.text;
        if (!expected) throw new Error("expect-url step requires url, path, or text.");
        await page.waitForTimeout(step.waitAfterMs ?? 500);
        const currentUrl = page.url();
        if (!currentUrl.includes(expected)) {
          throw new Error(`Expected URL to include ${expected}, got ${currentUrl}`);
        }
        return `Expected URL matched: ${expected}`;
      }

      case "check-links": {
        const maxLinks = step.maxLinks ?? scenario.maxLinks ?? 10;
        const links = await this.collectLinks(page, scenario.baseUrl, maxLinks);
        state.links.push(...links);
        const brokenLinks = links.filter((link) => link.status === "failed");
        if (brokenLinks.length > 0) {
          state.issues.push({ severity: "medium", type: "broken-links", message: `${brokenLinks.length} broken links found.`, source: step.id });
        }
        return `Checked ${links.length} links, ${brokenLinks.length} broken.`;
      }

      case "screenshot": {
        const safeName = this.safeFileName(step.name ?? step.id);
        const filePath = path.join(screenshotDir, `${dayjs().format("YYYY-MM-DD-HHmmss")}-${safeName}.png`);
        await page.screenshot({ path: filePath, fullPage: true });
        state.screenshotPaths.push(filePath);
        return `Screenshot saved: ${filePath}`;
      }

      default: {
        const neverStep: never = step.type;
        throw new Error(`Unsupported step type: ${neverStep}`);
      }
    }
  }

  private resolveStepValue(step: BrowserScenarioStep): string {
    if (step.valueFromEnv) {
      const envValue = this.readEnvValue(step.valueFromEnv);
      if (!envValue) {
        throw new Error(`Environment variable not found or empty: ${step.valueFromEnv}`);
      }
      return envValue;
    }

    if (typeof step.value === "string") {
      return step.value;
    }

    throw new Error("fill step requires value or valueFromEnv.");
  }

  private readEnvValue(name: string): string | undefined {
    if (process.env[name]) return process.env[name];

    try {
      const raw = require("node:fs").readFileSync(".env", "utf8") as string;
      const lines = raw.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const index = trimmed.indexOf("=");
        if (index === -1) continue;
        const key = trimmed.slice(0, index).trim();
        const value = trimmed.slice(index + 1).trim().replace(/^['\"]|['\"]$/g, "");
        if (key === name) return value;
      }
    } catch {
      return undefined;
    }

    return undefined;
  }

  private resolveUrl(baseUrl: string, pathValue?: string): string {
    if (!pathValue) return baseUrl;
    return new URL(pathValue, baseUrl).toString();
  }

  private async collectLinks(page: Page, baseUrl: string, maxLinks: number): Promise<BrowserScenarioLinkCheckResult[]> {
    const hrefs = await page.locator("a[href]").evaluateAll((anchors) =>
      anchors.map((anchor) => (anchor as HTMLAnchorElement).href).filter(Boolean)
    );

    const uniqueLinks = Array.from(new Set(hrefs)).slice(0, maxLinks);
    const results: BrowserScenarioLinkCheckResult[] = [];

    for (const href of uniqueLinks) {
      try {
        const url = new URL(href, baseUrl).toString();
        const response = await page.request.get(url, { timeout: 10000, failOnStatusCode: false });
        const statusCode = response.status();
        results.push({ url, status: statusCode >= 400 ? "failed" : "passed", statusCode });
      } catch (error) {
        results.push({ url: href, status: "failed", error: error instanceof Error ? error.message : String(error) });
      }
    }

    return results;
  }

  private calculateRiskScore(failedSteps: number, skippedSteps: number, state: RuntimeState, brokenLinks: number): number {
    const score =
      failedSteps * 50 +
      skippedSteps * 5 +
      state.consoleErrors.length * 10 +
      state.pageErrors.length * 15 +
      state.failedRequests.length * 10 +
      brokenLinks * 10;

    return Math.min(100, score);
  }

  private safeFileName(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "screenshot";
  }
}

