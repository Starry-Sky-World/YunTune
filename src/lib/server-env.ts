import "server-only";

import { getConfig } from "@/lib/config";

export function getRequiredServerEnv(name: string): string {
  const config = getConfig() as Record<string, unknown>;
  const fromConfig = config[name];
  if (typeof fromConfig === "string" && fromConfig.trim()) return fromConfig;
  const fromEnv = process.env[name];
  if (!fromEnv) throw new Error(`Missing required env: ${name}`);
  return fromEnv;
}

export function getPublicServerEnv() {
  const config = getConfig();
  return {
    appName: config.NEXT_PUBLIC_APP_NAME ?? process.env.NEXT_PUBLIC_APP_NAME ?? "YunTune",
  };
}

