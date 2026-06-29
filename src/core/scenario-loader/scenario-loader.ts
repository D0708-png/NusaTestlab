import fs from "node:fs/promises";
import type { Dirent } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { readJsonFile } from "../../utils/json-file.js";
import type { TestScenario } from "../types.js";

const assertionOperatorSchema = z.enum([
  "equals",
  "notEquals",
  "contains",
  "notContains",
  "greaterThan",
  "greaterThanOrEqual",
  "lessThan",
  "lessThanOrEqual",
  "isTrue",
  "isFalse",
  "exists",
  "notExists",
  "matchesRegex"
]);

const severitySchema = z.enum(["low", "medium", "high", "critical"]);

const assertionStepSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.literal("assertion"),
  operator: assertionOperatorSchema,
  actual: z.unknown(),
  expected: z.unknown().optional(),
  message: z.string().optional()
});

const scenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  module: z.string().min(1),
  severity: severitySchema.default("medium"),
  tags: z.array(z.string()).default([]),
  steps: z.array(assertionStepSchema).min(1)
});

export class ScenarioLoader {
  constructor(private readonly profilesDir = path.join(process.cwd(), "profiles")) {}

  async loadScenarios(profileName: string): Promise<TestScenario[]> {
    const scenarioDir = path.join(this.profilesDir, profileName, "scenarios");

    let entries: Dirent[];

    try {
      entries = await fs.readdir(scenarioDir, { withFileTypes: true });
    } catch {
      throw new Error(`Scenario directory not found: ${scenarioDir}`);
    }

    const scenarioFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => path.join(scenarioDir, entry.name));

    if (scenarioFiles.length === 0) {
      throw new Error(`No scenario files found in: ${scenarioDir}`);
    }

    const scenarios: TestScenario[] = [];

    for (const scenarioFile of scenarioFiles) {
      const rawJson = await readJsonFile<unknown>(scenarioFile);
      const parsed = scenarioSchema.safeParse(rawJson);

      if (!parsed.success) {
        throw new Error(
          `Invalid scenario file ${path.basename(scenarioFile)}: ${JSON.stringify(
            parsed.error.flatten().fieldErrors
          )}`
        );
      }

      scenarios.push(parsed.data as TestScenario);
    }

    return scenarios.sort((a, b) => a.id.localeCompare(b.id));
  }
}
