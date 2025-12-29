import { NextResponse } from "next/server";
import { neteaseGet } from "@/lib/bff/netease";
import { fail, ok } from "@/lib/bff/errors";
import type { PlaylistDetail, Track } from "@/lib/types/music";
import { readSession } from "@/lib/session/cookies";

function normalizeSong(song: any): Track {
  return {
    id: song.id,
    name: song.name,
    artists: Array.isArray(song.ar) ? song.ar.map((a: any) => ({ id: a.id, name: a.name })) : [],
    album: song.al ? { id: song.al.id, name: song.al.name, picUrl: song.al.picUrl } : undefined,
    durationMs: song.dt,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json(fail("UPSTREAM_ERROR", "Missing id"), { status: 400 });
  const cookies = (await readSession())?.cookies;

  const res = await neteaseGet<any>(
    "/playlist/detail",
    new URLSearchParams({ id, timestamp: Date.now().toString() }),
    cookies,
  );
  if (!res.ok) return NextResponse.json(res, { status: 502 });

  const pl = res.data.playlist;
  if (!pl) return NextResponse.json(fail("UPSTREAM_ERROR", "Invalid upstream response"), { status: 502 });

  const detail: PlaylistDetail = {
    id: pl.id,
    name: pl.name,
    coverImgUrl: pl.coverImgUrl,
    trackCount: pl.trackCount,
    description: pl.description ?? "",
    creatorName: pl.creator?.nickname,
    tracks: Array.isArray(pl.tracks) ? pl.tracks.map(normalizeSong) : [],
  };

  return NextResponse.json(ok(detail));
}
