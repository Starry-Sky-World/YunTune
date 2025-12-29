import { NextResponse } from "next/server";
import { neteaseGet } from "@/lib/bff/netease";
import { fail, ok } from "@/lib/bff/errors";
import { readSession } from "@/lib/session/cookies";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json(fail("UPSTREAM_ERROR", "Missing id"), { status: 400 });
  const cookies = (await readSession())?.cookies;

  const res = await neteaseGet<any>("/lyric", new URLSearchParams({ id, timestamp: Date.now().toString() }), cookies);
  if (!res.ok) return NextResponse.json(res, { status: 502 });

  return NextResponse.json(
    ok({
      id: Number(id),
      lrc: res.data.lrc?.lyric ?? "",
      tlyric: res.data.tlyric?.lyric ?? "",
      nolyric: Boolean(res.data.nolyric),
      pureMusic: Boolean(res.data.pureMusic),
    }),
  );
}
