import { NextResponse } from "next/server";
import { neteaseGet } from "@/lib/bff/netease";
import { fail, ok, upstreamError } from "@/lib/bff/errors";
import { extractCookiesFromCookieString, extractCookiesFromSetCookieHeaders } from "@/lib/bff/upstreamCookies";
import { readSession, writeSession } from "@/lib/session/cookies";
import type { YunTuneSessionV1 } from "@/lib/session/types";
import { upstreamGet } from "@/lib/bff/upstreamFetch";

type QrCheckRes = {
  code: number;
  message?: string;
  cookie?: string;
};

function mapQrStatus(code: number) {
  if (code === 800) return "expired";
  if (code === 801) return "waiting";
  if (code === 802) return "scanned";
  if (code === 803) return "authorized";
  return "unknown";
}

async function fetchAccount(cookies: Record<string, string>) {
  const res = await neteaseGet<{ code: number; profile?: { userId: number; nickname?: string; avatarUrl?: string } }>(
    "/user/account",
    new URLSearchParams({ timestamp: Date.now().toString() }),
    cookies,
  );
  if (!res.ok) return null;
  if (!res.data.profile?.userId) return null;
  return {
    userId: res.data.profile.userId,
    nickname: res.data.profile.nickname,
    avatarUrl: res.data.profile.avatarUrl,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) {
      return NextResponse.json(fail("UPSTREAM_ERROR", "Missing key"), { status: 400 });
    }

    const upstream = await upstreamGet<QrCheckRes>(
      "/login/qr/check",
      new URLSearchParams({ key, timestamp: Date.now().toString() }),
    );
    if (!upstream.ok) return NextResponse.json(upstreamError("Upstream request failed"), { status: 502 });

    const status = mapQrStatus(upstream.data.code);
    if (status !== "authorized") {
      return NextResponse.json(ok({ status }));
    }

    const session: YunTuneSessionV1 = (await readSession()) ?? { v: 1 };
    const fromHeader = extractCookiesFromSetCookieHeaders(upstream.setCookies ?? []);
    const fromBody = upstream.data.cookie ? extractCookiesFromCookieString(upstream.data.cookie) : {};
    const cookies = { ...(session.cookies ?? {}), ...fromHeader, ...fromBody };

    const user = await fetchAccount(cookies);
    await writeSession({
      v: 1,
      cookies,
      user: user ?? session.user,
    });

    return NextResponse.json(ok({ status: "authorized" }));
  } catch {
    return NextResponse.json(upstreamError("Server error"), { status: 500 });
  }
}
