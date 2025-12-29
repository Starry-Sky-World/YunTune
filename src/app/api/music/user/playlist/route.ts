import { NextResponse } from "next/server";
import { neteaseGet } from "@/lib/bff/netease";
import { fail, ok } from "@/lib/bff/errors";
import type { PlaylistSummary } from "@/lib/types/music";
import { readSession } from "@/lib/session/cookies";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json(fail("UPSTREAM_ERROR", "Missing uid"), { status: 400 });
  const cookies = (await readSession())?.cookies;

  const res = await neteaseGet<any>(
    "/user/playlist",
    new URLSearchParams({ uid, timestamp: Date.now().toString() }),
    cookies,
  );
  if (!res.ok) return NextResponse.json(res, { status: 502 });

  const playlists: PlaylistSummary[] = Array.isArray(res.data.playlist)
    ? res.data.playlist.map((p: any) => ({
        id: p.id,
        name: p.name,
        coverImgUrl: p.coverImgUrl,
        trackCount: p.trackCount,
        creatorName: p.creator?.nickname,
      }))
    : [];

  return NextResponse.json(ok({ uid: Number(uid), playlists }));
}
