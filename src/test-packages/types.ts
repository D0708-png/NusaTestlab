export interface ExportedTestPackageFile {
  path: string;
  kind:
    | "profile-config"
    | "endpoints"
    | "core-scenario"
    | "security-scenario"
    | "performance-scenario"
    | "ai-scenario"
    | "data-schema"
    | "test-matrix"
    | "other-json";
  content: unknown;
}

export interface ExportedTestPackage {
  packageFormat: "nusa-testlab-package";
  packageVersion: "1.0";
  exportedAt: string;
  source: {
    profileName: string;
    profileDir: string;
    nusaTestLabVersion: string;
  };
  summary: {
    files: number;
    coreScenarioFiles: number;
    securityScenarioFiles: number;
    performanceScenarioFiles: number;
    aiScenarioFiles: number;
  };
  files: ExportedTestPackageFile[];
  checksum: string;
}

export interface TestPackageExportOptions {
  profileName: string;
  outputDir: string;
  outputFile?: string;
}

export interface TestPackageExportResult {
  packagePath: string;
  package: ExportedTestPackage;
}
