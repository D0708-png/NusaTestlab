import fs from "node:fs/promises";
import path from "node:path";
import { readJsonFile } from "../utils/json-file.js";
import type {
  ExportedTestPackage,
  ExportedTestPackageFile,
  TestPackageExportOptions,
  TestPackageExportResult
} from "./types.js";

export class TestPackageExporter {
  constructor(
    private readonly profilesDir = path.join(process.cwd(), "profiles"),
    private readonly packageJsonPath = path.join(process.cwd(), "package.json")
  ) {}

  async export(options: TestPackageExportOptions): Promise<TestPackageExportResult> {
    validateProfileName(options.profileName);

    const profileDir = path.join(this.profilesDir, options.profileName);
    await ensureDirectoryExists(profileDir, `Profile not found: ${options.profileName}`);

    const files = await this.collectProfileFiles(profileDir);
    const nusaTestLabVersion = await this.readNusaTestLabVersion();

    const packageWithoutChecksum: Omit<ExportedTestPackage, "checksum"> = {
      packageFormat: "nusa-testlab-package",
      packageVersion: "1.0",
      exportedAt: new Date().toISOString(),
      source: {
        profileName: options.profileName,
        profileDir,
        nusaTestLabVersion
      },
      summary: {
        files: files.length,
        coreScenarioFiles: files.filter((file) => file.kind === "core-scenario").length,
        securityScenarioFiles: files.filter((file) => file.kind === "security-scenario").length,
        performanceScenarioFiles: files.filter((file) => file.kind === "performance-scenario").length,
        aiScenarioFiles: files.filter((file) => file.kind === "ai-scenario").length
      },
      files
    };

    const checksum = createChecksum(JSON.stringify(packageWithoutChecksum));
    const exportedPackage: ExportedTestPackage = {
      ...packageWithoutChecksum,
      checksum
    };

    await fs.mkdir(options.outputDir, { recursive: true });

    const packagePath = path.join(
      options.outputDir,
      options.outputFile ?? `${options.profileName}-test-package.json`
    );

    await fs.writeFile(packagePath, `${JSON.stringify(exportedPackage, null, 2)}\n`, "utf-8");

    return {
      packagePath,
      package: exportedPackage
    };
  }

  private async collectProfileFiles(profileDir: string): Promise<ExportedTestPackageFile[]> {
    const files: ExportedTestPackageFile[] = [];

    await this.collectJsonFiles(profileDir, profileDir, files);

    return files.sort((a, b) => a.path.localeCompare(b.path));
  }

  private async collectJsonFiles(
    rootDir: string,
    currentDir: string,
    files: ExportedTestPackageFile[]
  ): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await this.collectJsonFiles(rootDir, fullPath, files);
        continue;
      }

      if (!entry.isFile() || !entry.name.endsWith(".json")) {
        continue;
      }

      const relativePath = normalizePath(path.relative(rootDir, fullPath));
      const content = await readJsonFile<unknown>(fullPath);

      files.push({
        path: relativePath,
        kind: resolvePackageFileKind(relativePath),
        content
      });
    }
  }

  private async readNusaTestLabVersion(): Promise<string> {
    try {
      const packageJson = await readJsonFile<{ version?: string }>(this.packageJsonPath);
      return packageJson.version ?? "0.0.0";
    } catch {
      return "0.0.0";
    }
  }
}

function resolvePackageFileKind(relativePath: string): ExportedTestPackageFile["kind"] {
  if (relativePath === "profile.config.json") {
    return "profile-config";
  }

  if (relativePath === "endpoints.json") {
    return "endpoints";
  }

  if (relativePath.startsWith("scenarios/")) {
    return "core-scenario";
  }

  if (relativePath === "security.scenarios.json" || /^security\..+\.json$/.test(relativePath)) {
    return "security-scenario";
  }

  if (relativePath === "performance.scenarios.json" || /^performance\..+\.json$/.test(relativePath)) {
    return "performance-scenario";
  }

  if (relativePath === "ai.scenarios.json" || /^ai\..+\.json$/.test(relativePath)) {
    return "ai-scenario";
  }

  if (relativePath === "data-schema.json") {
    return "data-schema";
  }

  if (relativePath === "test-matrix.json") {
    return "test-matrix";
  }

  return "other-json";
}

function validateProfileName(profileName: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profileName)) {
    throw new Error("Profile name must use kebab-case.");
  }
}

async function ensureDirectoryExists(directoryPath: string, message: string): Promise<void> {
  try {
    const stat = await fs.stat(directoryPath);

    if (!stat.isDirectory()) {
      throw new Error(message);
    }
  } catch {
    throw new Error(message);
  }
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

function createChecksum(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(16).padStart(8, "0");
}
