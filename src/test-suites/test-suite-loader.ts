import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { readJsonFile } from "../utils/json-file.js";
import type { TestSuiteConfig } from "./types.js";

const taskTypeSchema = z.enum([
  "core",
  "inventory-validation",
  "report-validation",
  "security",
  "performance",
  "dashboard-build",
  "dashboard-compare"
]);

const suiteTaskSchema = z.object({
  id: z.string().min(1),
  type: taskTypeSchema,
  enabled: z.boolean().default(true),
  continueOnFailure: z.boolean().optional()
});

const suiteConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  profile: z.string().min(1),
  mode: z.enum(["dry-run", "live"]).default("dry-run"),
  tasks: z.array(suiteTaskSchema).default([])
});

export class TestSuiteLoader {
  constructor(private readonly suitesDir = path.join(process.cwd(), "suites")) {}

  async list(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.suitesDir, { withFileTypes: true });

      return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map((entry) => entry.name.replace(/\.json$/, ""))
        .sort();
    } catch {
      return [];
    }
  }

  async load(suiteNameOrPath: string): Promise<TestSuiteConfig> {
    const suitePath = suiteNameOrPath.endsWith(".json")
      ? path.resolve(suiteNameOrPath)
      : path.join(this.suitesDir, `${suiteNameOrPath}.json`);

    const raw = await readJsonFile<unknown>(suitePath);
    const parsed = suiteConfigSchema.safeParse(raw);

    if (!parsed.success) {
      throw new Error(
        `Invalid test suite file ${suitePath}: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
      );
    }

    const suite = parsed.data as TestSuiteConfig;
    ensureUniqueTaskIds(suite);

    return suite;
  }
}

function ensureUniqueTaskIds(suite: TestSuiteConfig): void {
  const seen = new Set<string>();

  for (const task of suite.tasks) {
    if (seen.has(task.id)) {
      throw new Error(`Duplicate suite task id found: ${task.id}`);
    }

    seen.add(task.id);
  }
}
