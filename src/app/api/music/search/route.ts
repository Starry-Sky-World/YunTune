import { NextResponse } from "next/server";
import { neteaseGet } from "@/lib/bff/netease";
import { fail, ok } from "@/lib/bff/errors";
import type { Track } from "@/lib/types/music";
import { readSession } from "@/lib/session/cookies";

function toInt(value: string | null, fallback: number) {
  const n = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

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
  const keywords = searchParams.get("keywords")?.trim();
  if (!keywords) return NextResponse.json(fail("UPSTREAM_ERROR", "Missing keywords"), { status: 400 });

  const type = toInt(searchParams.get("type"), 1);
  const limit = toInt(searchParams.get("limit"), 20);
  const offset = toInt(searchParams.get("offset"), 0);
  const cookies = (await readSession())?.cookies;

  const res = await neteaseGet<any>(
    "/search",
    new URLSearchParams({
      keywords,
      type: String(type),
      limit: String(limit),
      offset: String(offset),
      timestamp: Date.now().toString(),
    }),
    cookies,
  );

  if (!res.ok) return NextResponse.json(res, { status: 502 });

  const result = res.data.result ?? {};

  if (type === 1) {
    const songs = Array.isArray(result.songs) ? result.songs.map(normalizeSong) : [];
    return NextResponse.json(ok({ type, songs, songCount: result.songCount ?? songs.length }));
  }

  return NextResponse.json(ok({ type, result }));
}
