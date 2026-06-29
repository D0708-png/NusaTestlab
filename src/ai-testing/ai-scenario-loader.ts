import path from "node:path";
import { z } from "zod";
import { readJsonFile } from "../utils/json-file.js";
import type { AiScenario } from "./types.js";

const severitySchema = z.enum(["low", "medium", "high", "critical"]);

const aiScenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  module: z.string().default("ai-testing"),
  severity: severitySchema.default("medium"),
  tags: z.array(z.string()).default([]),
  role: z.string().default("owner"),
  prompt: z.string().min(1),
  endpointPath: z.string().min(1),
  expectedContains: z.array(z.string()).optional(),
  forbiddenContains: z.array(z.string()).optional(),
  forbiddenPatterns: z.array(z.string()).optional(),
  expectedStatus: z.number().int().min(100).max(599).optional(),
  expectedRefusal: z.boolean().optional(),
  description: z.string().optional()
});

const aiScenarioFileSchema = z.object({
  scenarios: z.array(aiScenarioSchema).default([])
});

export class AiScenarioLoader {
  constructor(private readonly profilesDir = path.join(process.cwd(), "profiles")) {}

  async load(profileName: string): Promise<AiScenario[]> {
    const filePath = path.join(this.profilesDir, profileName, "ai.scenarios.json");
    return this.loadFromFile(filePath);
  }

  async loadFromFile(filePath: string): Promise<AiScenario[]> {
    const raw = await readJsonFile<unknown>(filePath);
    const parsed = aiScenarioFileSchema.safeParse(raw);

    if (!parsed.success) {
      throw new Error(
        `Invalid AI scenario file ${filePath}: ${JSON.stringify(
          parsed.error.flatten().fieldErrors
        )}`
      );
    }

    return parsed.data.scenarios.sort((a, b) => a.id.localeCompare(b.id)) as AiScenario[];
  }
}
