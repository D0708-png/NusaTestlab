import fs from "node:fs/promises";
import path from "node:path";
import { RiskScoreEngine } from "./risk-score-engine.js";
import type {
  DashboardModuleSummary,
  DashboardRecommendation,
  DashboardReport,
  DashboardStatus,
  RiskLevel
} from "./types.js";

interface RawReport {
  status?: string;
  summary?: Record<string, unknown>;
  issues?: unknown[];
  scenarios?: Array<Record<string, unknown>>;
}

export class DashboardDataBuilder {
  private readonly riskEngine = new RiskScoreEngine();

  constructor(private readonly resultsDir: string) {}

  async build(): Promise<DashboardReport> {
    const modules: DashboardModuleSummary[] = [];

    modules.push(await this.buildTestRunModule());
    modules.push(await this.buildValidationModule("inventory-validation", "Inventory Validation", "latest-inventory-validation.json"));
    modules.push(await this.buildValidationModule("report-validation", "Report Validation", "latest-report-validation.json"));
    modules.push(await this.buildTestRunLikeModule("security", "Security Testing", "latest-security-report.json"));
    modules.push(await this.buildTestRunLikeModule("ai", "AI Testing", "latest-ai-report.json"));
    modules.push(await this.buildTestRunLikeModule("performance", "Performance Testing", "latest-performance-report.json"));
    modules.push(await this.buildTransactionSimulationModule());

    const availableModules = modules.filter((module) => module.status !== "missing").length;
    const missingModules = modules.length - availableModules;

    const totalTests = modules.reduce((total, module) => total + module.total, 0);
    const totalPassed = modules.reduce((total, module) => total + module.passed, 0);
    const totalFailed = modules.reduce((total, module) => total + module.failed, 0);
    const totalWarnings = modules.reduce((total, module) => total + module.warning, 0);
    const totalIssues = modules.reduce((total, module) => total + module.issues, 0);
    const overallRisk = this.riskEngine.calculateOverall(modules.map((module) => module.riskScore));

    return {
      generatedAt: new Date().toISOString(),
      version: "0.4.0-dev",
      title: "NusaTestLab Dashboard",
      summary: {
        modules: modules.length,
        availableModules,
        missingModules,
        totalTests,
        totalPassed,
        totalFailed,
        totalWarnings,
        totalIssues,
        overallRiskScore: overallRisk.score,
        overallRiskLevel: overallRisk.level
      },
      modules,
      recommendations: this.buildRecommendations(modules)
    };
  }

  private async buildTestRunModule(): Promise<DashboardModuleSummary> {
    const sourcePath = path.join(this.resultsDir, "latest-report.json");
    const report = await this.readReport(sourcePath);

    if (!report) {
      return this.missingModule("core", "Core Scenario Testing", sourcePath);
    }

    const summary = report.summary ?? {};

    return this.createModule({
      id: "core",
      name: "Core Scenario Testing",
      sourcePath,
      total: toNumber(summary.total),
      passed: toNumber(summary.passed),
      failed: toNumber(summary.failed),
      warning: toNumber(summary.warning),
      skipped: toNumber(summary.skipped),
      issues: this.countScenarioFailures(report),
      notes: ["Core profile scenario result."]
    });
  }

  private async buildTestRunLikeModule(
    id: string,
    name: string,
    fileName: string
  ): Promise<DashboardModuleSummary> {
    const sourcePath = path.join(this.resultsDir, fileName);
    const report = await this.readReport(sourcePath);

    if (!report) {
      return this.missingModule(id, name, sourcePath);
    }

    const summary = report.summary ?? {};
    const issues = this.countScenarioFailures(report);

    return this.createModule({
      id,
      name,
      sourcePath,
      total: toNumber(summary.total),
      passed: toNumber(summary.passed),
      failed: toNumber(summary.failed),
      warning: toNumber(summary.warning),
      skipped: toNumber(summary.skipped),
      issues,
      notes: [`${name} latest report loaded.`]
    });
  }

  private async buildValidationModule(
    id: string,
    name: string,
    fileName: string
  ): Promise<DashboardModuleSummary> {
    const sourcePath = path.join(this.resultsDir, fileName);
    const report = await this.readReport(sourcePath);

    if (!report) {
      return this.missingModule(id, name, sourcePath);
    }

    const summary = report.summary ?? {};
    const issues = Array.isArray(report.issues) ? report.issues.length : toNumber(summary.issues);
    const failed = toNumber(summary.failed);
    const passed = toNumber(summary.passed);
    const total =
      toNumber(summary.totalProducts) ||
      toNumber(summary.checkedFields) ||
      passed + failed;

    return this.createModule({
      id,
      name,
      sourcePath,
      total,
      passed,
      failed,
      warning: report.status === "warning" ? 1 : 0,
      skipped: 0,
      issues,
      notes: [`${name} latest report loaded.`]
    });
  }

  private async buildTransactionSimulationModule(): Promise<DashboardModuleSummary> {
    const sourcePath = path.join(this.resultsDir, "latest-transaction-simulation.json");
    const report = await this.readReport(sourcePath);

    if (!report) {
      return this.missingModule("transaction-simulation", "Transaction Simulation", sourcePath);
    }

    const summary = report.summary ?? {};
    const issues = Array.isArray(report.issues) ? report.issues.length : 0;
    const status = report.status === "failed" ? "failed" : "passed";
    const failed = status === "failed" ? issues || 1 : 0;

    return this.createModule({
      id: "transaction-simulation",
      name: "Transaction Simulation",
      sourcePath,
      total: toNumber(summary.totalTransactions),
      passed: toNumber(summary.completedTransactions),
      failed,
      warning: toNumber(summary.rejectedTransactions) > 0 ? 1 : 0,
      skipped: 0,
      issues,
      notes: [
        `Throughput: ${toNumber(summary.throughputPerSecond)} tx/s`,
        `Rejected transactions: ${toNumber(summary.rejectedTransactions)}`
      ]
    });
  }

  private createModule(input: {
    id: string;
    name: string;
    sourcePath: string;
    total: number;
    passed: number;
    failed: number;
    warning: number;
    skipped: number;
    issues: number;
    notes: string[];
  }): DashboardModuleSummary {
    const status = this.resolveStatus(input.failed, input.warning, input.total);
    const risk = this.riskEngine.calculate({
      total: input.total,
      failed: input.failed,
      warning: input.warning,
      issues: input.issues
    });

    return {
      id: input.id,
      name: input.name,
      status,
      sourcePath: input.sourcePath,
      total: input.total,
      passed: input.passed,
      failed: input.failed,
      warning: input.warning,
      skipped: input.skipped,
      issues: input.issues,
      riskScore: risk.score,
      riskLevel: risk.level,
      notes: input.notes
    };
  }

  private missingModule(id: string, name: string, sourcePath: string): DashboardModuleSummary {
    const risk = this.riskEngine.calculate({
      total: 0,
      failed: 0,
      warning: 0,
      issues: 0,
      missing: true
    });

    return {
      id,
      name,
      status: "missing",
      sourcePath,
      total: 0,
      passed: 0,
      failed: 0,
      warning: 0,
      skipped: 0,
      issues: 0,
      riskScore: risk.score,
      riskLevel: risk.level,
      notes: ["Latest report is missing. Run the related test command first."]
    };
  }

  private resolveStatus(failed: number, warning: number, total: number): DashboardStatus {
    if (total === 0) {
      return "missing";
    }

    if (failed > 0) {
      return "failed";
    }

    if (warning > 0) {
      return "warning";
    }

    return "passed";
  }

  private countScenarioFailures(report: RawReport): number {
    if (!Array.isArray(report.scenarios)) {
      return 0;
    }

    return report.scenarios.filter((scenario) => scenario.status === "failed").length;
  }

  private buildRecommendations(modules: DashboardModuleSummary[]): DashboardRecommendation[] {
    const recommendations: DashboardRecommendation[] = [];

    for (const module of modules) {
      if (module.status === "missing") {
        recommendations.push({
          level: "medium",
          module: module.name,
          message: `Run the missing report command for ${module.name}.`
        });
      }

      if (module.failed > 0 || module.issues > 0) {
        recommendations.push({
          level: module.riskLevel,
          module: module.name,
          message: `${module.name} has failures or issues. Review ${module.sourcePath}.`
        });
      }

      if (module.riskLevel === "high" || module.riskLevel === "critical") {
        recommendations.push({
          level: module.riskLevel,
          module: module.name,
          message: `${module.name} has ${module.riskLevel} risk score. Prioritize this module.`
        });
      }
    }

    if (recommendations.length === 0) {
      recommendations.push({
        level: "low",
        module: "overall",
        message: "No major issues detected in latest reports."
      });
    }

    return recommendations;
  }

  private async readReport(filePath: string): Promise<RawReport | undefined> {
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      return JSON.parse(raw.replace(/^\uFEFF/, "")) as RawReport;
    } catch {
      return undefined;
    }
  }
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}
