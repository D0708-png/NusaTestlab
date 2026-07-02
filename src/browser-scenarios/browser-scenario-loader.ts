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
    "wait-for-selector",
    "check-links",
    "screenshot"
  ]),
  path: z.string().optional(),
  url: z.string().url().optional(),
  selector: z.string().optional(),
  value: z.string().optional(),
  text: z.string().optional(),
  name: z.string().optional(),
  expectedStatus: z.number().int().positive().optional(),
  timeoutMs: z.number().int().positive().optional(),
  maxLinks: z.number().int().nonnegative().optional()
});

const scenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  baseUrl: z.string().url(),
  viewport: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive()
  }).optional(),
  maxLinks: z.number().int().nonnegative().optional(),
  continueOnFailure: z.boolean().optional(),
  steps: z.array(stepSchema).min(1)
});

export class BrowserScenarioLoader {
  async load(filePath: string): Promise<BrowserScenarioConfig> {
    const resolvedPath = path.resolve(filePath);
    const raw = await readJsonFile<unknown>(resolvedPath);
    const parsed = scenarioSchema.safeParse(raw);

    if (!parsed.success) {
      throw new Error(
        `Invalid browser scenario file ${resolvedPath}: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
      );
    }

    const scenario = parsed.data as BrowserScenarioConfig;
    validateSteps(scenario);

    return scenario;
  }
}

function validateSteps(scenario: BrowserScenarioConfig): void {
  const seen = new Set<string>();

  for (const step of scenario.steps) {
    if (seen.has(step.id)) {
      throw new Error(`Duplicate browser scenario step id found: ${step.id}`);
    }

    seen.add(step.id);

    if (step.type === "click" || step.type === "fill" || step.type === "wait-for-selector") {
      if (!step.selector) {
        throw new Error(`Step ${step.id} requires selector.`);
      }
    }

    if (step.type === "fill" && step.value === undefined) {
      throw new Error(`Step ${step.id} requires value.`);
    }

    if (step.type === "expect-text" && !step.text) {
      throw new Error(`Step ${step.id} requires text.`);
    }
  }
}
