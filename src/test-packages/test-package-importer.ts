import fs from "node:fs/promises";
import path from "node:path";
import { readJsonFile } from "../utils/json-file.js";
import type { ExportedTestPackage, ExportedTestPackageFile } from "./types.js";

export interface TestPackageImportOptions {
  packagePath: string;
  profileName?: string;
  profilesDir?: string;
  overwrite: boolean;
  skipChecksum: boolean;
}

export interface TestPackageImportResult {
  profileName: string;
  profileDir: string;
  importedFiles: string[];
  skippedFiles: string[];
  checksumValid: boolean;
}

export class TestPackageImporter {
  async importPackage(options: TestPackageImportOptions): Promise<TestPackageImportResult> {
    const exportedPackage = await readJsonFile<ExportedTestPackage>(options.packagePath);

    validatePackage(exportedPackage);

    const checksumValid = verifyChecksum(exportedPackage);

    if (!checksumValid && !options.skipChecksum) {
      throw new Error("Package checksum is invalid. Use --skip-checksum only if you trust this package.");
    }

    const profileName = options.profileName ?? exportedPackage.source.profileName;
    validateProfileName(profileName);

    const profilesDir = options.profilesDir ?? path.join(process.cwd(), "profiles");
    const profileDir = path.join(profilesDir, profileName);

    if ((await exists(profileDir)) && !options.overwrite) {
      throw new Error(`Profile already exists: ${profileName}. Use --overwrite to replace it.`);
    }

    await fs.mkdir(profileDir, { recursive: true });

    const importedFiles: string[] = [];
    const skippedFiles: string[] = [];

    for (const file of exportedPackage.files) {
      const safeRelativePath = sanitizeRelativePath(file.path);
      const outputPath = path.join(profileDir, safeRelativePath);

      if ((await exists(outputPath)) && !options.overwrite) {
        skippedFiles.push(outputPath);
        continue;
      }

      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      const content = maybeRewriteProfileConfig(file, profileName);
      await fs.writeFile(outputPath, `${JSON.stringify(content, null, 2)}\n`, "utf-8");

      importedFiles.push(outputPath);
    }

    return {
      profileName,
      profileDir,
      importedFiles,
      skippedFiles,
      checksumValid,
    };
  }
}

function validatePackage(pkg: ExportedTestPackage): void {
  if (pkg.packageFormat !== "nusa-testlab-package") {
    throw new Error("Invalid package format.");
  }

  if (pkg.packageVersion !== "1.0") {
    throw new Error(`Unsupported package version: ${pkg.packageVersion}`);
  }

  if (!pkg.source?.profileName) {
    throw new Error("Package source profileName is missing.");
  }

  if (!Array.isArray(pkg.files)) {
    throw new Error("Package files must be an array.");
  }
}

function verifyChecksum(pkg: ExportedTestPackage): boolean {
  const { checksum, ...withoutChecksum } = pkg;
  return createChecksum(JSON.stringify(withoutChecksum)) === checksum;
}

function maybeRewriteProfileConfig(file: ExportedTestPackageFile, profileName: string): unknown {
  if (file.path !== "profile.config.json") {
    return file.content;
  }

  if (!isRecord(file.content)) {
    return file.content;
  }

  return {
    ...file.content,
    profileName,
  };
}

function sanitizeRelativePath(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/");

  if (
    normalized.startsWith("/") ||
    normalized.includes("../") ||
    normalized === ".." ||
    path.isAbsolute(normalized)
  ) {
    throw new Error(`Unsafe package file path: ${relativePath}`);
  }

  if (!normalized.endsWith(".json")) {
    throw new Error(`Package file must be JSON: ${relativePath}`);
  }

  return normalized;
}

function validateProfileName(profileName: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profileName)) {
    throw new Error("Profile name must use kebab-case.");
  }
}

async function exists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function createChecksum(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(16).padStart(8, "0");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
