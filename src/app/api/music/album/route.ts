import { NextResponse } from "next/server";
import { neteaseGet } from "@/lib/bff/netease";
import { fail, ok } from "@/lib/bff/errors";
import { readSession } from "@/lib/session/cookies";
import type { Track } from "@/lib/types/music";

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

  const res = await neteaseGet<any>("/album", new URLSearchParams({ id, timestamp: Date.now().toString() }), cookies);
  if (!res.ok) return NextResponse.json(res, { status: 502 });

  const album = res.data.album;
  const songs: Track[] = Array.isArray(res.data.songs) ? res.data.songs.map(normalizeSong) : [];
  return NextResponse.json(
    ok({
      id: Number(id),
      name: album?.name ?? "",
      picUrl: album?.picUrl,
      artistName: album?.artist?.name,
      publishTime: album?.publishTime,
      tracks: songs,
    }),
  );
}

