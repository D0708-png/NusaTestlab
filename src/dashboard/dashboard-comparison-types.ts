import type { RiskLevel } from "./types.js";

export interface DashboardComparisonDelta {
  overallRiskScore: number;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalWarnings: number;
  totalIssues: number;
}

export interface ModuleComparisonDelta {
  moduleId: string;
  moduleName: string;
  previousRiskScore: number;
  currentRiskScore: number;
  riskDelta: number;
  previousFailed: number;
  currentFailed: number;
  failedDelta: number;
  previousIssues: number;
  currentIssues: number;
  issueDelta: number;
}

export interface DashboardComparisonReport {
  generatedAt: string;
  status: "baseline" | "compared";
  previousSnapshot?: string;
  currentSnapshot?: string;
  summary: {
    previousGeneratedAt?: string;
    currentGeneratedAt?: string;
    previousRiskLevel?: RiskLevel;
    currentRiskLevel?: RiskLevel;
    riskDelta: number;
    failedDelta: number;
    issueDelta: number;
    trend: "improved" | "regressed" | "unchanged" | "baseline";
  };
  delta: DashboardComparisonDelta;
  modules: ModuleComparisonDelta[];
  notes: string[];
}
