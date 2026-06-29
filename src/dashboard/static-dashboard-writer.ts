import fs from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import type { DashboardModuleSummary, DashboardReport } from "./types.js";

export class StaticDashboardWriter {
  constructor(private readonly outputDir: string) {}

  async write(report: DashboardReport): Promise<{
    htmlPath: string;
    jsonPath: string;
    historyJsonPath: string;
  }> {
    const historyDir = path.join(this.outputDir, "history");

    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(historyDir, { recursive: true });

    const htmlPath = path.join(this.outputDir, "index.html");
    const jsonPath = path.join(this.outputDir, "dashboard.json");
    const historyJsonPath = path.join(
      historyDir,
      `${dayjs(report.generatedAt).format("YYYY-MM-DD-HHmmss")}-dashboard.json`
    );

    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");
    await fs.writeFile(historyJsonPath, JSON.stringify(report, null, 2), "utf-8");
    await fs.writeFile(htmlPath, this.toHtml(report), "utf-8");

    return {
      htmlPath,
      jsonPath,
      historyJsonPath
    };
  }

  private toHtml(report: DashboardReport): string {
    const moduleRows = report.modules.map((module) => this.moduleRow(module)).join("\n");
    const recommendationItems = report.recommendations
      .map(
        (item) =>
          `<li><span class="badge ${item.level}">${escapeHtml(item.level)}</span> <strong>${escapeHtml(
            item.module
          )}</strong>: ${escapeHtml(item.message)}</li>`
      )
      .join("\n");

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(report.title)}</title>
  <style>
    :root {
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #172033;
      background: #f5f7fb;
    }

    body {
      margin: 0;
      padding: 32px;
    }

    .container {
      max-width: 1180px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 32px;
    }

    .muted {
      color: #667085;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .card {
      background: #ffffff;
      border: 1px solid #e6e8ef;
      border-radius: 16px;
      padding: 18px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
    }

    .metric {
      font-size: 28px;
      font-weight: 800;
      margin-top: 6px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .02em;
    }

    .passed, .low {
      background: #dcfce7;
      color: #166534;
    }

    .warning, .medium, .missing {
      background: #fef3c7;
      color: #92400e;
    }

    .failed, .high {
      background: #fee2e2;
      color: #991b1b;
    }

    .critical {
      background: #7f1d1d;
      color: #ffffff;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
      border-radius: 14px;
      background: #ffffff;
      border: 1px solid #e6e8ef;
    }

    th, td {
      text-align: left;
      padding: 13px 14px;
      border-bottom: 1px solid #eef0f5;
      font-size: 14px;
      vertical-align: top;
    }

    th {
      background: #f8fafc;
      color: #475467;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .section {
      margin-top: 24px;
    }

    .notes {
      margin: 0;
      padding-left: 18px;
      color: #667085;
    }

    .recommendations {
      margin: 0;
      padding-left: 20px;
    }

    .recommendations li {
      margin: 8px 0;
    }

    @media (max-width: 900px) {
      body {
        padding: 18px;
      }

      .header {
        flex-direction: column;
      }

      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      table {
        display: block;
        overflow-x: auto;
      }
    }

    @media (max-width: 560px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <main class="container">
    <section class="header">
      <div>
        <h1>${escapeHtml(report.title)}</h1>
        <div class="muted">Generated at ${escapeHtml(report.generatedAt)}</div>
      </div>
      <div>
        <span class="badge ${report.summary.overallRiskLevel}">Risk: ${escapeHtml(
          report.summary.overallRiskLevel
        )}</span>
      </div>
    </section>

    <section class="grid">
      <div class="card">
        <div class="muted">Overall Risk Score</div>
        <div class="metric">${report.summary.overallRiskScore}</div>
      </div>
      <div class="card">
        <div class="muted">Total Tests</div>
        <div class="metric">${report.summary.totalTests}</div>
      </div>
      <div class="card">
        <div class="muted">Failures</div>
        <div class="metric">${report.summary.totalFailed}</div>
      </div>
      <div class="card">
        <div class="muted">Issues</div>
        <div class="metric">${report.summary.totalIssues}</div>
      </div>
    </section>

    <section class="card section">
      <h2>Module Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Module</th>
            <th>Status</th>
            <th>Risk</th>
            <th>Total</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Warnings</th>
            <th>Issues</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${moduleRows}
        </tbody>
      </table>
    </section>

    <section class="card section">
      <h2>Recommendations</h2>
      <ul class="recommendations">
        ${recommendationItems}
      </ul>
    </section>
  </main>
</body>
</html>`;
  }

  private moduleRow(module: DashboardModuleSummary): string {
    const notes = module.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("");

    return `<tr>
  <td><strong>${escapeHtml(module.name)}</strong><br /><span class="muted">${escapeHtml(
    module.sourcePath
  )}</span></td>
  <td><span class="badge ${module.status}">${escapeHtml(module.status)}</span></td>
  <td><span class="badge ${module.riskLevel}">${module.riskScore} / ${escapeHtml(
    module.riskLevel
  )}</span></td>
  <td>${module.total}</td>
  <td>${module.passed}</td>
  <td>${module.failed}</td>
  <td>${module.warning}</td>
  <td>${module.issues}</td>
  <td><ul class="notes">${notes}</ul></td>
</tr>`;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
