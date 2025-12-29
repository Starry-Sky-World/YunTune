import { NextResponse } from "next/server";
import { neteaseGet } from "@/lib/bff/netease";
import { fail, ok } from "@/lib/bff/errors";
import { readSession } from "@/lib/session/cookies";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json(fail("UPSTREAM_ERROR", "Missing id"), { status: 400 });
  const level = searchParams.get("level") ?? "standard";
  const cookies = (await readSession())?.cookies;

  const res = await neteaseGet<any>(
    "/song/url/v1",
    new URLSearchParams({ id, level, timestamp: Date.now().toString() }),
    cookies,
  );
  if (!res.ok) return NextResponse.json(res, { status: 502 });

  const item = Array.isArray(res.data.data) ? res.data.data[0] : null;
  const url = item?.url ?? null;
  if (!url) {
    return NextResponse.json(fail("NO_COPYRIGHT", "No playable url"), { status: 403 });
  }
  return NextResponse.json(ok({ id: Number(id), url, level, br: item?.br ?? null, type: item?.type ?? null }));
}
