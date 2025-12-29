import type { BffFail, BffResponse, BffOk } from "./errors";
import { fail, ok } from "./errors";
import { upstreamGet } from "./upstreamFetch";
import type { UpstreamCookieMap } from "@/lib/session/types";

type NeteaseCommon = { code?: number; message?: string; msg?: string };

function messageFrom(json: unknown): string {
  if (json && typeof json === "object") {
    const anyJson = json as Record<string, unknown>;
    const m = anyJson.message ?? anyJson.msg;
    if (typeof m === "string" && m.trim()) return m;
  }
  return "Upstream error";
}

function mapUpstreamError(json: unknown): BffFail {
  const code = (json as NeteaseCommon | undefined)?.code;
  const message = messageFrom(json);

  if (code === 301) return fail("LOGIN_REQUIRED", "Login required");
  if (code === 302) return fail("LOGIN_EXPIRED", "Login expired");
  if (code === 404) return fail("UPSTREAM_ERROR", "Not found");

  if (code === 403 || message.includes("无版权") || message.toLowerCase().includes("copyright")) {
    return fail("NO_COPYRIGHT", "No copyright");
  }
  if (message.includes("频繁") || message.toLowerCase().includes("too many")) {
    return fail("RATE_LIMITED", "Rate limited");
  }

  return fail("UPSTREAM_ERROR", message);
}

export async function neteaseGet<T extends NeteaseCommon, R = T>(
  pathname: string,
  params: URLSearchParams,
  cookies?: UpstreamCookieMap,
): Promise<BffResponse<R>> {
  const { bff } = await neteaseGetWithSetCookies<T, R>(pathname, params, cookies);
  return bff;
}

export async function neteaseGetWithSetCookies<T extends NeteaseCommon, R = T>(
  pathname: string,
  params: URLSearchParams,
  cookies?: UpstreamCookieMap,
): Promise<{ bff: BffResponse<R>; setCookies: string[] }> {
  const res = await upstreamGet<T>(pathname, params, cookies);
  const setCookies = res.setCookies ?? [];
  if (!res.ok) {
    return { bff: fail("UPSTREAM_ERROR", "Upstream request failed"), setCookies };
  }
  const code = res.data?.code;
  if (code !== 200) {
    return { bff: mapUpstreamError(res.data), setCookies };
  }
  return { bff: ok(res.data as unknown as R), setCookies };
}

export type { BffResponse };
