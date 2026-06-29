export interface EndpointDefinition {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  module: string;
  requiredRole?: string;
  description?: string;
}

export interface SaaSProfileConfig {
  profileName: string;
  displayName: string;
  description: string;
  version: string;
  modules: string[];
  defaultRoles: string[];
}

export interface LoadedSaaSProfile {
  config: SaaSProfileConfig;
  endpoints: EndpointDefinition[];
  scenarioCount: number;
  profileDir: string;
}
