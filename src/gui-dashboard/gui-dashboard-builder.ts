import fs from "node:fs/promises";
import path from "node:path";

export interface GuiDashboardBuildResult {
  outputPath: string;
  reports: {
    suite: boolean;
    browser: boolean;
    browserScenario: boolean;
  };
}

interface SummaryCard {
  title: string;
  status: string;
  subtitle: string;
  details: string[];
  riskScore?: number;
}

export class GuiDashboardBuilder {
  constructor(private readonly resultsDir = path.join(process.cwd(), "results")) {}

  async build(): Promise<GuiDashboardBuildResult> {
    const outputDir = path.join(this.resultsDir, "gui-dashboard");
    await fs.mkdir(outputDir, { recursive: true });

    const suiteReport = await readOptionalJson(path.join(this.resultsDir, "latest-suite-report.json"));
    const browserReport = await readOptionalJson(path.join(this.resultsDir, "latest-browser-report.json"));
    const browserScenarioReport = await readOptionalJson(path.join(this.resultsDir, "latest-browser-scenario-report.json"));

    const cards = [
      createSuiteCard(suiteReport),
      createBrowserCard(browserReport),
      createBrowserScenarioCard(browserScenarioReport)
    ];

    const html = renderHtml(cards, {
      generatedAt: new Date().toISOString(),
      resultsDir: this.resultsDir
    });

    const outputPath = path.join(outputDir, "index.html");
    await fs.writeFile(outputPath, html, "utf-8");

    return {
      outputPath,
      reports: {
        suite: Boolean(suiteReport),
        browser: Boolean(browserReport),
        browserScenario: Boolean(browserScenarioReport)
      }
    };
  }
}

async function readOptionalJson(filePath: string): Promise<any | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw.replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
}

function createSuiteCard(report: any | null): SummaryCard {
  if (!report) {
    return {
      title: "Suite Report",
      status: "missing",
      subtitle: "No suite report found.",
      details: ["Run npm run suites:ai-umkm or npm run suites:generic first."]
    };
  }

  return {
    title: "Suite Report",
    status: report.status ?? "unknown",
    subtitle: report.suiteName ?? report.suiteId ?? "Latest suite run",
    details: [
      `Profile: ${report.profile ?? "unknown"}`,
      `Mode: ${report.mode ?? "unknown"}`,
      `Total: ${report.summary?.total ?? 0}`,
      `Passed: ${report.summary?.passed ?? 0}`,
      `Failed: ${report.summary?.failed ?? 0}`,
      `Skipped: ${report.summary?.skipped ?? 0}`
    ]
  };
}

function createBrowserCard(report: any | null): SummaryCard {
  if (!report) {
    return {
      title: "Browser Report",
      status: "missing",
      subtitle: "No browser report found.",
      details: ["Run npm run browser:example first."]
    };
  }

  return {
    title: "Browser Report",
    status: report.status ?? "unknown",
    subtitle: report.targetUrl ?? "Latest browser test",
    riskScore: Number(report.riskScore ?? 0),
    details: [
      `Final URL: ${report.finalUrl ?? "unknown"}`,
      `Issues: ${report.issues?.length ?? 0}`,
      `Console Errors: ${report.consoleErrors?.length ?? 0}`,
      `Page Errors: ${report.pageErrors?.length ?? 0}`,
      `Failed Requests: ${report.failedRequests?.length ?? 0}`,
      `Broken Links: ${report.linkChecks?.filter?.((link: any) => !link.ok)?.length ?? 0}`
    ]
  };
}

function createBrowserScenarioCard(report: any | null): SummaryCard {
  if (!report) {
    return {
      title: "Browser Scenario Report",
      status: "missing",
      subtitle: "No browser scenario report found.",
      details: ["Run npm run browser:scenario:example first."]
    };
  }

  return {
    title: "Browser Scenario Report",
    status: report.status ?? "unknown",
    subtitle: report.scenarioName ?? report.scenarioId ?? "Latest browser scenario",
    riskScore: Number(report.riskScore ?? 0),
    details: [
      `Base URL: ${report.baseUrl ?? "unknown"}`,
      `Total Steps: ${report.summary?.total ?? 0}`,
      `Passed: ${report.summary?.passed ?? 0}`,
      `Failed: ${report.summary?.failed ?? 0}`,
      `Skipped: ${report.summary?.skipped ?? 0}`
    ]
  };
}

function renderHtml(cards: SummaryCard[], meta: { generatedAt: string; resultsDir: string }): string {
  const cardHtml = cards.map(renderCard).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NusaTestLab GUI Dashboard Alpha</title>
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0f172a; color: #e5e7eb; }
    header { padding: 32px; border-bottom: 1px solid #1f2937; background: linear-gradient(135deg, #111827, #0f172a); }
    main { padding: 32px; max-width: 1200px; margin: 0 auto; }
    h1 { margin: 0 0 8px; font-size: 32px; }
    p { color: #9ca3af; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .card { border: 1px solid #1f2937; border-radius: 18px; padding: 20px; background: #111827; box-shadow: 0 20px 60px rgba(0,0,0,.25); }
    .card h2 { margin: 0 0 12px; font-size: 20px; }
    .status { display: inline-flex; padding: 4px 10px; border-radius: 999px; font-size: 13px; font-weight: 700; text-transform: uppercase; }
    .passed { background: #064e3b; color: #a7f3d0; }
    .failed { background: #7f1d1d; color: #fecaca; }
    .warning { background: #78350f; color: #fde68a; }
    .missing, .unknown { background: #374151; color: #d1d5db; }
    ul { padding-left: 18px; line-height: 1.8; color: #d1d5db; }
    .risk { font-size: 42px; font-weight: 800; margin: 16px 0 0; }
    .commands { margin-top: 32px; border: 1px solid #1f2937; border-radius: 18px; padding: 20px; background: #020617; }
    code, pre { color: #a7f3d0; }
    pre { overflow-x: auto; }
    footer { padding: 32px; text-align: center; color: #6b7280; }
  </style>
</head>
<body>
  <header>
    <h1>NusaTestLab GUI Dashboard Alpha</h1>
    <p>Generated at ${escapeHtml(meta.generatedAt)} from local report files.</p>
  </header>
  <main>
    <section class="grid">
      ${cardHtml}
    </section>
    <section class="commands">
      <h2>Recommended Commands</h2>
      <pre>npm run suites:ai-umkm
npm run browser:example
npm run browser:scenario:example
npm run gui:build</pre>
    </section>
  </main>
  <footer>NusaTestLab local dashboard. Read-only alpha.</footer>
</body>
</html>`;
}

function renderCard(card: SummaryCard): string {
  const statusClass = normalizeStatus(card.status);
  const risk = typeof card.riskScore === "number" ? `<div class="risk">${card.riskScore}</div><p>Risk Score</p>` : "";
  const details = card.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("\n");

  return `<article class="card">
    <h2>${escapeHtml(card.title)}</h2>
    <span class="status ${statusClass}">${escapeHtml(card.status)}</span>
    <p>${escapeHtml(card.subtitle)}</p>
    ${risk}
    <ul>${details}</ul>
  </article>`;
}

function normalizeStatus(status: string): string {
  const value = status.toLowerCase();
  if (["passed", "failed", "warning", "missing"].includes(value)) {
    return value;
  }
  return "unknown";
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
