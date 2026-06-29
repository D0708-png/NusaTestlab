import fs from "node:fs/promises";
import path from "node:path";

export interface ProfileScaffoldOptions {
  profileName: string;
  displayName: string;
  description: string;
  roles: string[];
  modules: string[];
  overwrite: boolean;
}

export interface ProfileScaffoldResult {
  profileDir: string;
  createdFiles: string[];
  skippedFiles: string[];
}

export class ProfileScaffolder {
  constructor(private readonly profilesDir = path.join(process.cwd(), "profiles")) {}

  async create(options: ProfileScaffoldOptions): Promise<ProfileScaffoldResult> {
    validateProfileName(options.profileName);

    const profileDir = path.join(this.profilesDir, options.profileName);
    const scenariosDir = path.join(profileDir, "scenarios");

    await fs.mkdir(scenariosDir, { recursive: true });

    const createdFiles: string[] = [];
    const skippedFiles: string[] = [];

    const files = [
      {
        path: path.join(profileDir, "profile.config.json"),
        content: JSON.stringify(createProfileConfig(options), null, 2)
      },
      {
        path: path.join(profileDir, "endpoints.json"),
        content: JSON.stringify(createEndpointsConfig(options), null, 2)
      },
      {
        path: path.join(scenariosDir, "core.smoke.json"),
        content: JSON.stringify(createCoreSmokeScenario(options), null, 2)
      },
      {
        path: path.join(profileDir, "security.scenarios.json"),
        content: JSON.stringify(createSecurityScenarios(options), null, 2)
      },
      {
        path: path.join(profileDir, "performance.scenarios.json"),
        content: JSON.stringify(createPerformanceScenarios(options), null, 2)
      }
    ];

    for (const file of files) {
      const exists = await fileExists(file.path);

      if (exists && !options.overwrite) {
        skippedFiles.push(file.path);
        continue;
      }

      await fs.writeFile(file.path, `${file.content}\n`, "utf-8");
      createdFiles.push(file.path);
    }

    return {
      profileDir,
      createdFiles,
      skippedFiles
    };
  }
}

function validateProfileName(profileName: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profileName)) {
    throw new Error(
      "Profile name must use kebab-case lowercase letters, numbers, and hyphens only. Example: clinic-saas"
    );
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function createProfileConfig(options: ProfileScaffoldOptions): unknown {
  return {
    profileName: options.profileName,
    displayName: options.displayName,
    description: options.description,
    version: "0.1.0",
    modules: options.modules,
    defaultRoles: options.roles
  };
}

function createEndpointsConfig(options: ProfileScaffoldOptions): unknown {
  const defaultRole = options.roles[0] ?? "member";

  return {
    endpoints: [
      {
        id: "health-check",
        name: "Health Check",
        method: "GET",
        path: "/health",
        module: "system",
        requiredRole: "none",
        description: "Checks whether the target SaaS API is running."
      },
      {
        id: "current-user",
        name: "Current User",
        method: "GET",
        path: "/api/auth/me",
        module: "auth",
        requiredRole: defaultRole,
        description: "Returns the current authenticated user."
      }
    ]
  };
}

function createCoreSmokeScenario(options: ProfileScaffoldOptions): unknown {
  return {
    id: `${options.profileName}-core-smoke`,
    name: `${options.displayName} core smoke test`,
    module: "core",
    severity: "low",
    tags: ["smoke", "core", options.profileName],
    steps: [
      {
        id: "profile-name-check",
        name: "Profile name should be configured",
        type: "assertion",
        operator: "equals",
        actual: options.profileName,
        expected: options.profileName
      },
      {
        id: "default-role-count-check",
        name: "Profile should have at least one default role",
        type: "assertion",
        operator: "greaterThanOrEqual",
        actual: options.roles.length,
        expected: 1
      }
    ]
  };
}

function createSecurityScenarios(options: ProfileScaffoldOptions): unknown {
  const defaultRole = options.roles[0] ?? "member";

  return {
    scenarios: [
      {
        id: `${options.profileName}-no-token-auth-me`,
        name: "No token must not access current user endpoint",
        module: "security",
        severity: "high",
        tags: ["auth", "no-token"],
        method: "GET",
        path: "/api/auth/me",
        role: "none",
        expectedStatus: 401
      },
      {
        id: `${options.profileName}-invalid-token-auth-me`,
        name: "Invalid token must not access current user endpoint",
        module: "security",
        severity: "high",
        tags: ["auth", "invalid-token"],
        method: "GET",
        path: "/api/auth/me",
        role: "invalid",
        expectedStatus: 401
      },
      {
        id: `${options.profileName}-${defaultRole}-auth-me`,
        name: "Authenticated role should access current user endpoint",
        module: "security",
        severity: "medium",
        tags: ["auth", "role-access"],
        method: "GET",
        path: "/api/auth/me",
        role: defaultRole,
        expectedStatus: 200
      }
    ]
  };
}

function createPerformanceScenarios(options: ProfileScaffoldOptions): unknown {
  return {
    scenarios: [
      {
        id: `${options.profileName}-health-check-performance`,
        name: "Health check endpoint baseline performance",
        module: "performance",
        severity: "medium",
        tags: ["performance", "health"],
        method: "GET",
        path: "/health",
        role: "none",
        expectedStatus: 200,
        requests: 10,
        concurrency: 2,
        maxAverageMs: 300,
        maxP95Ms: 800,
        maxErrorRate: 0
      }
    ]
  };
}
