import fs from "node:fs/promises";
import path from "node:path";

export type ScenarioTemplateType = "core" | "security" | "performance" | "ai";

export interface ScenarioTemplateOptions {
  profileName: string;
  type: ScenarioTemplateType;
  scenarioName: string;
  module?: string;
  role?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path?: string;
  overwrite: boolean;
}

export interface ScenarioTemplateResult {
  outputPath: string;
  created: boolean;
  skipped: boolean;
  message: string;
}

export class ScenarioTemplateGenerator {
  constructor(private readonly profilesDir = path.join(process.cwd(), "profiles")) {}

  async create(options: ScenarioTemplateOptions): Promise<ScenarioTemplateResult> {
    validateProfileName(options.profileName);
    validateScenarioName(options.scenarioName);

    const profileDir = path.join(this.profilesDir, options.profileName);

    if (!(await exists(profileDir))) {
      throw new Error(`Profile not found: ${options.profileName}`);
    }

    const outputPath = this.resolveOutputPath(profileDir, options);

    if ((await exists(outputPath)) && !options.overwrite) {
      return {
        outputPath,
        created: false,
        skipped: true,
        message: "Scenario file already exists. Use --overwrite to replace it."
      };
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${JSON.stringify(this.createTemplate(options), null, 2)}\n`, "utf-8");

    return {
      outputPath,
      created: true,
      skipped: false,
      message: "Scenario template created."
    };
  }

  private resolveOutputPath(profileDir: string, options: ScenarioTemplateOptions): string {
    if (options.type === "core") {
      return path.join(profileDir, "scenarios", `${options.scenarioName}.json`);
    }

    if (options.type === "security") {
      return path.join(profileDir, `security.${options.scenarioName}.json`);
    }

    if (options.type === "performance") {
      return path.join(profileDir, `performance.${options.scenarioName}.json`);
    }

    return path.join(profileDir, `ai.${options.scenarioName}.json`);
  }

  private createTemplate(options: ScenarioTemplateOptions): unknown {
    if (options.type === "core") {
      return createCoreScenario(options);
    }

    if (options.type === "security") {
      return {
        scenarios: [createSecurityScenario(options)]
      };
    }

    if (options.type === "performance") {
      return {
        scenarios: [createPerformanceScenario(options)]
      };
    }

    return {
      scenarios: [createAiScenario(options)]
    };
  }
}

function createCoreScenario(options: ScenarioTemplateOptions): unknown {
  return {
    id: `${options.profileName}-${options.scenarioName}`,
    name: toTitle(options.scenarioName),
    module: options.module ?? "core",
    severity: "medium",
    tags: [options.profileName, options.module ?? "core"],
    steps: [
      {
        id: "basic-equality-check",
        name: "Basic equality check",
        type: "assertion",
        operator: "equals",
        actual: "ready",
        expected: "ready"
      }
    ]
  };
}

function createSecurityScenario(options: ScenarioTemplateOptions): unknown {
  return {
    id: `${options.profileName}-${options.scenarioName}`,
    name: toTitle(options.scenarioName),
    module: options.module ?? "security",
    severity: "high",
    tags: [options.profileName, "security"],
    method: options.method ?? "GET",
    path: options.path ?? "/api/auth/me",
    role: options.role ?? "none",
    expectedStatus: options.role === "none" ? 401 : 403,
    description: "Generated security scenario template."
  };
}

function createPerformanceScenario(options: ScenarioTemplateOptions): unknown {
  return {
    id: `${options.profileName}-${options.scenarioName}`,
    name: toTitle(options.scenarioName),
    module: options.module ?? "performance",
    severity: "medium",
    tags: [options.profileName, "performance"],
    method: options.method ?? "GET",
    path: options.path ?? "/health",
    role: options.role ?? "none",
    expectedStatus: 200,
    requests: 10,
    concurrency: 2,
    maxAverageMs: 500,
    maxP95Ms: 1000,
    maxErrorRate: 0
  };
}

function createAiScenario(options: ScenarioTemplateOptions): unknown {
  return {
    id: `${options.profileName}-${options.scenarioName}`,
    name: toTitle(options.scenarioName),
    module: options.module ?? "ai-testing",
    severity: "medium",
    tags: [options.profileName, "ai"],
    role: options.role ?? "owner",
    endpointPath: options.path ?? "/api/ai/chat",
    prompt: "Replace this prompt with the AI test prompt.",
    expectedStatus: 200,
    forbiddenContains: ["password", "token", "api key"],
    description: "Generated AI scenario template."
  };
}

function validateProfileName(profileName: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profileName)) {
    throw new Error("Profile name must use kebab-case.");
  }
}

function validateScenarioName(scenarioName: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scenarioName)) {
    throw new Error("Scenario name must use kebab-case.");
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

function toTitle(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
