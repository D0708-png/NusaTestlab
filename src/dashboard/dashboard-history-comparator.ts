import fs from "node:fs/promises";
import path from "node:path";
import type { DashboardComparisonReport, ModuleComparisonDelta } from "./dashboard-comparison-types.js";
import type { DashboardModuleSummary, DashboardReport } from "./types.js";

export class DashboardHistoryComparator {
  constructor(private readonly dashboardDir: string) {}

  async compareLatest(): Promise<DashboardComparisonReport> {
    const historyDir = path.join(this.dashboardDir, "history");
    const snapshots = await this.listSnapshots(historyDir);

    if (snapshots.length < 2) {
      return {
        generatedAt: new Date().toISOString(),
        status: "baseline",
        currentSnapshot: snapshots[snapshots.length - 1],
        summary: {
          riskDelta: 0,
          failedDelta: 0,
          issueDelta: 0,
          trend: "baseline"
        },
        delta: {
          overallRiskScore: 0,
          totalTests: 0,
          totalPassed: 0,
          totalFailed: 0,
          totalWarnings: 0,
          totalIssues: 0
        },
        modules: [],
        notes: [
          "Not enough dashboard history snapshots to compare. Build the dashboard at least twice."
        ]
      };
    }

    const previousSnapshot = snapshots[snapshots.length - 2];
    const currentSnapshot = snapshots[snapshots.length - 1];

    const previous = await this.readSnapshot(previousSnapshot);
    const current = await this.readSnapshot(currentSnapshot);

    const riskDelta = current.summary.overallRiskScore - previous.summary.overallRiskScore;
    const failedDelta = current.summary.totalFailed - previous.summary.totalFailed;
    const issueDelta = current.summary.totalIssues - previous.summary.totalIssues;

    return {
      generatedAt: new Date().toISOString(),
      status: "compared",
      previousSnapshot,
      currentSnapshot,
      summary: {
        previousGeneratedAt: previous.generatedAt,
        currentGeneratedAt: current.generatedAt,
        previousRiskLevel: previous.summary.overallRiskLevel,
        currentRiskLevel: current.summary.overallRiskLevel,
        riskDelta,
        failedDelta,
        issueDelta,
        trend: resolveTrend(riskDelta, failedDelta, issueDelta)
      },
      delta: {
        overallRiskScore: riskDelta,
        totalTests: current.summary.totalTests - previous.summary.totalTests,
        totalPassed: current.summary.totalPassed - previous.summary.totalPassed,
        totalFailed: failedDelta,
        totalWarnings: current.summary.totalWarnings - previous.summary.totalWarnings,
        totalIssues: issueDelta
      },
      modules: compareModules(previous.modules, current.modules),
      notes: buildNotes(riskDelta, failedDelta, issueDelta)
    };
  }

  private async listSnapshots(historyDir: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(historyDir, { withFileTypes: true });

      return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith("-dashboard.json"))
        .map((entry) => path.join(historyDir, entry.name))
        .sort();
    } catch {
      return [];
    }
  }

  private async readSnapshot(filePath: string): Promise<DashboardReport> {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw.replace(/^\uFEFF/, "")) as DashboardReport;
  }
}

function compareModules(
  previousModules: DashboardModuleSummary[],
  currentModules: DashboardModuleSummary[]
): ModuleComparisonDelta[] {
  const previousById = new Map(previousModules.map((module) => [module.id, module]));

  return currentModules.map((current) => {
    const previous = previousById.get(current.id);

    return {
      moduleId: current.id,
      moduleName: current.name,
      previousRiskScore: previous?.riskScore ?? 0,
      currentRiskScore: current.riskScore,
      riskDelta: current.riskScore - (previous?.riskScore ?? 0),
      previousFailed: previous?.failed ?? 0,
      currentFailed: current.failed,
      failedDelta: current.failed - (previous?.failed ?? 0),
      previousIssues: previous?.issues ?? 0,
      currentIssues: current.issues,
      issueDelta: current.issues - (previous?.issues ?? 0)
    };
  });
}

function resolveTrend(
  riskDelta: number,
  failedDelta: number,
  issueDelta: number
): "improved" | "regressed" | "unchanged" {
  const combined = riskDelta + failedDelta * 8 + issueDelta * 4;

  if (combined > 0) {
    return "regressed";
  }

  if (combined < 0) {
    return "improved";
  }

  return "unchanged";
}

function buildNotes(riskDelta: number, failedDelta: number, issueDelta: number): string[] {
  const notes: string[] = [];

  if (riskDelta > 0) {
    notes.push(`Overall risk increased by ${riskDelta} point(s).`);
  } else if (riskDelta < 0) {
    notes.push(`Overall risk decreased by ${Math.abs(riskDelta)} point(s).`);
  } else {
    notes.push("Overall risk score is unchanged.");
  }

  if (failedDelta > 0) {
    notes.push(`Failed tests increased by ${failedDelta}.`);
  } else if (failedDelta < 0) {
    notes.push(`Failed tests decreased by ${Math.abs(failedDelta)}.`);
  }

  if (issueDelta > 0) {
    notes.push(`Issues increased by ${issueDelta}.`);
  } else if (issueDelta < 0) {
    notes.push(`Issues decreased by ${Math.abs(issueDelta)}.`);
  }

  return notes;
}
