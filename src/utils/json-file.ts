import fs from "node:fs/promises";

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const rawContent = await fs.readFile(filePath, "utf-8");
  const normalizedContent = rawContent.replace(/^\uFEFF/, "");

  try {
    return JSON.parse(normalizedContent) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse JSON file ${filePath}: ${message}`);
  }
}
