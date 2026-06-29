import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  TARGET_APP_NAME: z.string().default("ai-umkm-copilot"),
  TARGET_PROFILE: z.string().default("ai-umkm"),
  TARGET_API_BASE_URL: z.string().url().default("http://localhost:3000"),
  TARGET_API_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  TARGET_TEST_MODE: z
    .string()
    .default("true")
    .transform((value) => value === "true"),

  TEST_TENANT_ID: z.string().optional(),
  TEST_STORE_ID: z.string().optional(),

  OWNER_TOKEN: z.string().optional(),
  ADMIN_TOKEN: z.string().optional(),
  CASHIER_TOKEN: z.string().optional(),
  INVALID_TOKEN: z.string().default("invalid-test-token"),

  REPORT_OUTPUT_DIR: z.string().default("results")
});

export type EnvConfig = z.infer<typeof envSchema>;

export function loadEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid environment configuration:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}
