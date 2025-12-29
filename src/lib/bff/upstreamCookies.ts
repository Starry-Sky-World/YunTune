const ALLOWLIST = new Set([
  "MUSIC_U",
  "MUSIC_A",
  "__csrf",
  "NMTID",
  "MUSIC_R_T",
  "MUSIC_SNS",
]);

function splitSetCookieHeader(value: string): string[] {
  // Best-effort split: a new cookie usually starts after a comma followed by a token name and '='.
  return value.split(/, (?=[^;=]+=[^;]+)/g);
}

export function extractCookiesFromSetCookieHeaders(setCookieHeaders: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const header of setCookieHeaders) {
    const firstPart = header.split(";")[0]?.trim();
    if (!firstPart) continue;
    const eq = firstPart.indexOf("=");
    if (eq <= 0) continue;
    const name = firstPart.slice(0, eq);
    const value = firstPart.slice(eq + 1);
    if (!ALLOWLIST.has(name)) continue;
    result[name] = value;
  }
  return result;
}

export function extractCookiesFromCookieString(cookieString: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of cookieString.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const name = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!ALLOWLIST.has(name)) continue;
    result[name] = value;
  }
  return result;
}

export function getSetCookieHeaders(headers: Headers): string[] {
  const anyHeaders = headers as unknown as { getSetCookie?: () => string[] };
  if (typeof anyHeaders.getSetCookie === "function") {
    return anyHeaders.getSetCookie();
  }
  const raw = headers.get("set-cookie");
  if (!raw) return [];
  return splitSetCookieHeader(raw);
}

export function formatCookieHeader(cookies: Record<string, string> | undefined): string | undefined {
  if (!cookies) return undefined;
  const pairs = Object.entries(cookies).map(([k, v]) => `${k}=${v}`);
  return pairs.length ? pairs.join("; ") : undefined;
}

