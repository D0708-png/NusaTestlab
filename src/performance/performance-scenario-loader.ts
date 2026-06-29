import path from "node:path";
import { z } from "zod";
import { readJsonFile } from "../utils/json-file.js";
import type { PerformanceScenario } from "./types.js";

const httpMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const severitySchema = z.enum(["low", "medium", "high", "critical"]);

const performanceScenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  module: z.string().default("performance"),
  severity: severitySchema.default("medium"),
  tags: z.array(z.string()).default([]),
  method: httpMethodSchema.default("GET"),
  path: z.string().min(1),
  role: z.string().default("none"),
  expectedStatus: z.number().int().min(100).max(599).default(200),
  requests: z.number().int().positive().default(10),
  concurrency: z.number().int().positive().default(2),
  maxAverageMs: z.number().int().positive().optional(),
  maxP95Ms: z.number().int().positive().optional(),
  maxErrorRate: z.number().min(0).max(1).optional(),
  description: z.string().optional()
});

const performanceScenarioFileSchema = z.object({
  scenarios: z.array(performanceScenarioSchema).default([])
});

export class PerformanceScenarioLoader {
  constructor(private readonly profilesDir = path.join(process.cwd(), "profiles")) {}

  async load(profileName: string): Promise<PerformanceScenario[]> {
    const filePath = path.join(this.profilesDir, profileName, "performance.scenarios.json");
    const raw = await readJsonFile<unknown>(filePath);
    const parsed = performanceScenarioFileSchema.safeParse(raw);

    if (!parsed.success) {
      throw new Error(
        `Invalid performance scenario file ${filePath}: ${JSON.stringify(
          parsed.error.flatten().fieldErrors
        )}`
      );
    }

    return parsed.data.scenarios.sort((a, b) => a.id.localeCompare(b.id)) as PerformanceScenario[];
  }
}
