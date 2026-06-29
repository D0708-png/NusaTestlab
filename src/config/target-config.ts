import type { EnvConfig } from "./env.js";

export type TargetRole = "owner" | "admin" | "cashier" | "invalid" | "none" | string;

export interface TargetSaaSConfig {
  appName: string;
  profileName: string;
  apiBaseUrl: string;
  timeoutMs: number;
  testMode: boolean;
  tenantId?: string;
  storeId?: string;
  tokens: Record<string, string | undefined>;
}

export function buildTargetConfig(env: EnvConfig): TargetSaaSConfig {
  return {
    appName: env.TARGET_APP_NAME,
    profileName: env.TARGET_PROFILE,
    apiBaseUrl: env.TARGET_API_BASE_URL,
    timeoutMs: env.TARGET_API_TIMEOUT_MS,
    testMode: env.TARGET_TEST_MODE,
    tenantId: env.TEST_TENANT_ID,
    storeId: env.TEST_STORE_ID,
    tokens: {
      owner: env.OWNER_TOKEN,
      admin: env.ADMIN_TOKEN,
      cashier: env.CASHIER_TOKEN,
      invalid: env.INVALID_TOKEN
    }
  };
}

export function getTokenForRole(
  targetConfig: TargetSaaSConfig,
  role: TargetRole
): string | undefined {
  if (role === "none") {
    return undefined;
  }

  return targetConfig.tokens[role];
}

export function createAuthHeaders(
  targetConfig: TargetSaaSConfig,
  role: TargetRole
): Record<string, string> {
  const token = getTokenForRole(targetConfig, role);

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`
  };
}
