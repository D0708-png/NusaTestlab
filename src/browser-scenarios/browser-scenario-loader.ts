import path from "node:path";
import { z } from "zod";
import { readJsonFile } from "../utils/json-file.js";
import type { BrowserScenarioConfig } from "./types.js";

const stepSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "goto",
    "click",
    "fill",
    "expect-text",
    "expect-url",
    "wait-for-selector",
    "check-links",
    "screenshot"
  ]),
  path: z.string().optional(),
  url: z.string().url().optional(),
  selector: z.string().optional(),
  value: z.string().optional(),
  valueFromEnv: z.string().optional(),
  text: z.string().optional(),
  name: z.string().optional(),
  expectedStatus: z.number().int().positive().optional(),
  timeoutMs: z.number().int().positive().optional(),
  waitAfterMs: z.number().int().nonnegative().optional(),
  maxLinks: z.number().int().nonnegative().optional(),
  enabled: z.boolean().optional()
});

const scenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  baseUrl: z.string().url(),
  viewport: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive()
  }).optional(),
  maxLinks: z.number().int().nonnegative().optional(),
  continueOnFailure: z.boolean().optional(),
  steps: z.array(stepSchema)
});

export class BrowserScenarioLoader {
  async load(filePath: string): Promise<BrowserScenarioConfig> {
    const resolvedPath = path.resolve(filePath);
    const raw = await readJsonFile<unknown>(resolvedPath);
    return scenarioSchema.parse(raw) as BrowserScenarioConfig;
  }
}