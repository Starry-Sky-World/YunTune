import { NextResponse } from "next/server";
import { neteaseGet } from "@/lib/bff/netease";
import { ok } from "@/lib/bff/errors";
import { readSession } from "@/lib/session/cookies";

export async function GET() {
  const session = await readSession();
  const cookies = session?.cookies;
  const ts = Date.now().toString();

  const [personalized, toplist, recommendResource, fm] = await Promise.all([
    neteaseGet<any>("/personalized", new URLSearchParams({ limit: "10", timestamp: ts })),
    neteaseGet<any>("/toplist", new URLSearchParams({ timestamp: ts })),
    neteaseGet<any>("/recommend/resource", new URLSearchParams({ timestamp: ts }), cookies),
    neteaseGet<any>("/personal_fm", new URLSearchParams({ timestamp: ts }), cookies),
  ]);

  return NextResponse.json(
    ok({
      personalized: personalized.ok
        ? {
            ok: true,
            data: Array.isArray(personalized.data.result)
              ? personalized.data.result.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  picUrl: p.picUrl,
                  playCount: p.playCount,
                  trackCount: p.trackCount,
                }))
              : [],
          }
        : { ok: false, error: personalized.error },
      toplist: toplist.ok
        ? {
            ok: true,
            data: Array.isArray(toplist.data.list)
              ? toplist.data.list.slice(0, 12).map((t: any) => ({
                  id: t.id,
                  name: t.name,
                  coverImgUrl: t.coverImgUrl,
                  updateFrequency: t.updateFrequency,
                }))
              : [],
          }
        : { ok: false, error: toplist.error },
      daily: recommendResource.ok
        ? {
            ok: true,
            data: Array.isArray(recommendResource.data.recommend)
              ? recommendResource.data.recommend.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  picUrl: p.picUrl,
                  playcount: p.playcount,
                  trackCount: p.trackCount,
                }))
              : [],
          }
        : { ok: false, error: recommendResource.error },
      fm: fm.ok
        ? {
            ok: true,
            data: Array.isArray(fm.data.data)
              ? fm.data.data.map((s: any) => ({
                  id: s.id,
                  name: s.name,
                  artists: Array.isArray(s.artists) ? s.artists.map((a: any) => ({ id: a.id, name: a.name })) : [],
                  album: s.album ? { id: s.album.id, name: s.album.name, picUrl: s.album.picUrl } : undefined,
                  durationMs: s.duration,
                }))
              : [],
          }
        : { ok: false, error: fm.error },
    }),
  );
}
