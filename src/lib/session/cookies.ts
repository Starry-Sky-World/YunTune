import { cookies } from "next/headers";
import type { YunTuneSessionV1 } from "./types";
import { sealJson, unsealJson } from "./crypto";
import { getRequiredServerEnv } from "@/lib/server-env";

const COOKIE_PREFIX = "__Host-yuntune_s";
const MAX_COOKIE_VALUE_BYTES = 3600;

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
}

function chunkStringByBytes(value: string, maxBytes: number): string[] {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  const chunks: string[] = [];
  let start = 0;
  while (start < bytes.length) {
    let end = Math.min(bytes.length, start + maxBytes);
    while (end < bytes.length) {
      const slice = bytes.subarray(start, end);
      const decoded = new TextDecoder().decode(slice);
      const reencoded = encoder.encode(decoded);
      if (reencoded.length <= maxBytes) break;
      end -= 1;
    }
    const slice = bytes.subarray(start, end);
    chunks.push(new TextDecoder().decode(slice));
    start = end;
  }
  return chunks;
}

export async function readSession(): Promise<YunTuneSessionV1 | null> {
  const jar = await cookies();
  const secret = getRequiredServerEnv("SESSION_SECRET");
  const parts: string[] = [];
  for (let i = 1; i <= 10; i += 1) {
    const value = jar.get(`${COOKIE_PREFIX}${i}`)?.value;
    if (!value) break;
    parts.push(value);
  }
  if (parts.length === 0) return null;
  const token = parts.join("");
  return unsealJson<YunTuneSessionV1>(secret, token);
}

export async function writeSession(session: YunTuneSessionV1): Promise<void> {
  const jar = await cookies();
  const secret = getRequiredServerEnv("SESSION_SECRET");
  const token = sealJson(secret, { ...session, v: 1, updatedAt: Date.now() } satisfies YunTuneSessionV1);
  const chunks = chunkStringByBytes(token, MAX_COOKIE_VALUE_BYTES);

  await clearSession();
  const options = getCookieOptions();
  for (let i = 0; i < chunks.length; i += 1) {
    jar.set(`${COOKIE_PREFIX}${i + 1}`, chunks[i]!, options);
  }
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  const options = getCookieOptions();
  for (let i = 1; i <= 10; i += 1) {
    const name = `${COOKIE_PREFIX}${i}`;
    if (!jar.get(name)) continue;
    jar.set(name, "", { ...options, maxAge: 0 });
  }
}
