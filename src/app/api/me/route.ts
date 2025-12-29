import { NextResponse } from "next/server";
import { fail, ok } from "@/lib/bff/errors";
import { neteaseGet } from "@/lib/bff/netease";
import { clearSession, readSession, writeSession } from "@/lib/session/cookies";
import type { YunTuneSessionV1 } from "@/lib/session/types";

export async function GET() {
  const session = await readSession();
  if (!session?.cookies) {
    return NextResponse.json(fail("LOGIN_REQUIRED", "Login required"), { status: 401 });
  }

  const res = await neteaseGet<{
    code: number;
    profile?: { userId: number; nickname?: string; avatarUrl?: string };
  }>("/user/account", new URLSearchParams({ timestamp: Date.now().toString() }), session.cookies);

  if (!res.ok) {
    if (res.error.code === "LOGIN_REQUIRED" || res.error.code === "LOGIN_EXPIRED") {
      await clearSession();
      return NextResponse.json(fail("LOGIN_EXPIRED", "Login expired"), { status: 401 });
    }
    return NextResponse.json(res, { status: 502 });
  }

  const profile = res.data.profile;
  if (!profile?.userId) {
    return NextResponse.json(fail("UPSTREAM_ERROR", "Invalid upstream response"), { status: 502 });
  }

  const nextSession: YunTuneSessionV1 = {
    v: 1,
    cookies: session.cookies,
    user: { userId: profile.userId, nickname: profile.nickname, avatarUrl: profile.avatarUrl },
  };
  await writeSession(nextSession);
  return NextResponse.json(ok(nextSession.user));
}
