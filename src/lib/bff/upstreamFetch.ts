import { getRequiredServerEnv } from "@/lib/server-env";
import { formatCookieHeader } from "./upstreamCookies";
import type { UpstreamCookieMap } from "@/lib/session/types";
import { getSetCookieHeaders } from "./upstreamCookies";

export type UpstreamResult<T> =
  | { ok: true; data: T; setCookies?: string[] }
  | { ok: false; status: number; data?: unknown; setCookies?: string[] };

export async function upstreamGet<T>(
  pathname: string,
  searchParams: URLSearchParams,
  upstreamCookies?: UpstreamCookieMap,
  init?: RequestInit,
): Promise<UpstreamResult<T>> {
  const base = getRequiredServerEnv("NETEASE_API_BASE_URL").replace(/\/+$/, "");
  const url = new URL(base + pathname);
  url.search = searchParams.toString();

  const cookieHeader = formatCookieHeader(upstreamCookies);
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  let json: unknown = undefined;
  try {
    json = await res.json();
  } catch {
    json = undefined;
  }

  const setCookies = getSetCookieHeaders(res.headers);

  if (!res.ok) {
    return { ok: false, status: res.status, data: json, setCookies };
  }
  return { ok: true, data: json as T, setCookies };
}
