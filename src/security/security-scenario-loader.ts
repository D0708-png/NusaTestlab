import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { readJsonFile } from "../utils/json-file.js";
import type { SecurityScenario } from "./types.js";

const httpMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const severitySchema = z.enum(["low", "medium", "high", "critical"]);

const securityScenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  module: z.string().default("security"),
  severity: severitySchema.default("high"),
  tags: z.array(z.string()).default([]),
  method: httpMethodSchema.default("GET"),
  path: z.string().min(1),
  role: z.string().default("none"),
  expectedStatus: z.number().int().min(100).max(599),
  description: z.string().optional()
});

const securityScenarioFileSchema = z.object({
  scenarios: z.array(securityScenarioSchema).default([])
});

export class SecurityScenarioLoader {
  constructor(private readonly profilesDir = path.join(process.cwd(), "profiles")) {}

  async load(profileName: string): Promise<SecurityScenario[]> {
    const profileDir = path.join(this.profilesDir, profileName);
    const scenarioFiles = await this.listScenarioFiles(profileDir);

    if (scenarioFiles.length === 0) {
      throw new Error(`No security scenario files found in: ${profileDir}`);
    }

    const scenarios: SecurityScenario[] = [];

    for (const filePath of scenarioFiles) {
      const raw = await readJsonFile<unknown>(filePath);
      const parsed = securityScenarioFileSchema.safeParse(raw);

      if (!parsed.success) {
        throw new Error(
          `Invalid security scenario file ${filePath}: ${JSON.stringify(
            parsed.error.flatten().fieldErrors
          )}`
        );
      }

      scenarios.push(...(parsed.data.scenarios as SecurityScenario[]));
    }

    return this.ensureUniqueScenarioIds(scenarios).sort((a, b) => a.id.localeCompare(b.id));
  }

  private async listScenarioFiles(profileDir: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(profileDir, { withFileTypes: true });

      return entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => name === "security.scenarios.json" || /^security\..+\.json$/.test(name))
        .map((name) => path.join(profileDir, name))
        .sort();
    } catch {
      throw new Error(`Profile directory not found: ${profileDir}`);
    }
  }

  private ensureUniqueScenarioIds(scenarios: SecurityScenario[]): SecurityScenario[] {
    const seen = new Set<string>();

    for (const scenario of scenarios) {
      if (seen.has(scenario.id)) {
        throw new Error(`Duplicate security scenario id found: ${scenario.id}`);
      }

      seen.add(scenario.id);
    }

    return scenarios;
  }
}
