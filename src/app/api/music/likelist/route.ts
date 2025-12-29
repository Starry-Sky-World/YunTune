import { NextResponse } from "next/server";
import { neteaseGet } from "@/lib/bff/netease";
import { fail, ok } from "@/lib/bff/errors";
import { readSession } from "@/lib/session/cookies";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json(fail("UPSTREAM_ERROR", "Missing uid"), { status: 400 });
  const cookies = (await readSession())?.cookies;

  const res = await neteaseGet<any>(
    "/likelist",
    new URLSearchParams({ uid, timestamp: Date.now().toString() }),
    cookies,
  );
  if (!res.ok) return NextResponse.json(res, { status: 502 });

  const ids = Array.isArray(res.data.ids) ? res.data.ids : [];
  return NextResponse.json(ok({ uid: Number(uid), ids }));
}
