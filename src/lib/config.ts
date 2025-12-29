import "server-only";

import fs from "node:fs";
import path from "node:path";

export type YunTuneConfig = Partial<{
  NETEASE_API_BASE_URL: string;
  SESSION_SECRET: string;
  NEXT_PUBLIC_APP_NAME: string;
}>;

let cached: YunTuneConfig | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getConfig(): YunTuneConfig {
  if (cached) return cached;
  const file = path.join(process.cwd(), "config.json");
  try {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return (cached = {});
    cached = {
      NETEASE_API_BASE_URL: typeof parsed.NETEASE_API_BASE_URL === "string" ? parsed.NETEASE_API_BASE_URL : undefined,
      SESSION_SECRET: typeof parsed.SESSION_SECRET === "string" ? parsed.SESSION_SECRET : undefined,
      NEXT_PUBLIC_APP_NAME: typeof parsed.NEXT_PUBLIC_APP_NAME === "string" ? parsed.NEXT_PUBLIC_APP_NAME : undefined,
    };
    return cached;
  } catch {
    return (cached = {});
  }
}

