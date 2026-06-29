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
    const filePath = path.join(this.profilesDir, profileName, "security.scenarios.json");
    const raw = await readJsonFile<unknown>(filePath);
    const parsed = securityScenarioFileSchema.safeParse(raw);

    if (!parsed.success) {
      throw new Error(
        `Invalid security scenario file ${filePath}: ${JSON.stringify(
          parsed.error.flatten().fieldErrors
        )}`
      );
    }

    return parsed.data.scenarios.sort((a, b) => a.id.localeCompare(b.id)) as SecurityScenario[];
  }
}
