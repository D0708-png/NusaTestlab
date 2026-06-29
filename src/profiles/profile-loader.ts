import fs from "node:fs/promises";
import type { Dirent } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { readJsonFile } from "../utils/json-file.js";
import type { EndpointDefinition, LoadedSaaSProfile, SaaSProfileConfig } from "./types.js";

const httpMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);

const endpointSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  method: httpMethodSchema,
  path: z.string().min(1),
  module: z.string().min(1),
  requiredRole: z.string().optional(),
  description: z.string().optional()
});

const profileConfigSchema = z.object({
  profileName: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().min(1),
  version: z.string().min(1),
  modules: z.array(z.string()).default([]),
  defaultRoles: z.array(z.string()).default([])
});

const endpointsFileSchema = z.object({
  endpoints: z.array(endpointSchema).default([])
});

export class ProfileLoader {
  constructor(private readonly profilesDir = path.join(process.cwd(), "profiles")) {}

  async listProfiles(): Promise<SaaSProfileConfig[]> {
    const entries = await this.readProfileDirectories();
    const profiles: SaaSProfileConfig[] = [];

    for (const entry of entries) {
      const profileDir = path.join(this.profilesDir, entry.name);
      const configPath = path.join(profileDir, "profile.config.json");

      try {
        const profile = await this.loadProfileConfig(configPath);
        profiles.push(profile);
      } catch {
        // Skip invalid profile directories during list command.
      }
    }

    return profiles.sort((a, b) => a.profileName.localeCompare(b.profileName));
  }

  async loadProfile(profileName: string): Promise<LoadedSaaSProfile> {
    const profileDir = path.join(this.profilesDir, profileName);
    const configPath = path.join(profileDir, "profile.config.json");
    const endpointsPath = path.join(profileDir, "endpoints.json");
    const scenariosDir = path.join(profileDir, "scenarios");

    const config = await this.loadProfileConfig(configPath);
    const endpoints = await this.loadEndpoints(endpointsPath);
    const scenarioCount = await this.countScenarioFiles(scenariosDir);

    return {
      config,
      endpoints,
      scenarioCount,
      profileDir
    };
  }

  async profileExists(profileName: string): Promise<boolean> {
    try {
      await this.loadProfile(profileName);
      return true;
    } catch {
      return false;
    }
  }

  private async readProfileDirectories(): Promise<Dirent[]> {
    try {
      const entries = await fs.readdir(this.profilesDir, { withFileTypes: true });
      return entries.filter((entry) => entry.isDirectory());
    } catch {
      throw new Error(`Profiles directory not found: ${this.profilesDir}`);
    }
  }

  private async loadProfileConfig(configPath: string): Promise<SaaSProfileConfig> {
    const rawConfig = await readJsonFile<unknown>(configPath);
    const parsed = profileConfigSchema.safeParse(rawConfig);

    if (!parsed.success) {
      throw new Error(
        `Invalid profile config ${configPath}: ${JSON.stringify(
          parsed.error.flatten().fieldErrors
        )}`
      );
    }

    return parsed.data;
  }

  private async loadEndpoints(endpointsPath: string): Promise<EndpointDefinition[]> {
    try {
      const rawEndpoints = await readJsonFile<unknown>(endpointsPath);
      const parsed = endpointsFileSchema.safeParse(rawEndpoints);

      if (!parsed.success) {
        throw new Error(
          `Invalid endpoints config ${endpointsPath}: ${JSON.stringify(
            parsed.error.flatten().fieldErrors
          )}`
        );
      }

      return parsed.data.endpoints;
    } catch (error) {
      if (error instanceof Error && error.message.includes("ENOENT")) {
        return [];
      }

      throw error;
    }
  }

  private async countScenarioFiles(scenariosDir: string): Promise<number> {
    try {
      const entries = await fs.readdir(scenariosDir, { withFileTypes: true });
      return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json")).length;
    } catch {
      return 0;
    }
  }
}
