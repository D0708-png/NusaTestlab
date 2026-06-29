export type DashboardStatus = "passed" | "failed" | "warning" | "skipped" | "missing";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface DashboardModuleSummary {
  id: string;
  name: string;
  status: DashboardStatus;
  sourcePath: string;
  total: number;
  passed: number;
  failed: number;
  warning: number;
  skipped: number;
  issues: number;
  riskScore: number;
  riskLevel: RiskLevel;
  notes: string[];
}

export interface DashboardRecommendation {
  level: RiskLevel;
  module: string;
  message: string;
}

export interface DashboardReport {
  generatedAt: string;
  version: string;
  title: string;
  summary: {
    modules: number;
    availableModules: number;
    missingModules: number;
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    totalWarnings: number;
    totalIssues: number;
    overallRiskScore: number;
    overallRiskLevel: RiskLevel;
  };
  modules: DashboardModuleSummary[];
  recommendations: DashboardRecommendation[];
}
