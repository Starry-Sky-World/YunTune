"use client";

import * as React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/store/player";
import type { Track } from "@/lib/types/music";

type Res =
  | { ok: true; data: { id: number; name: string; picUrl?: string; briefDesc?: string; tracks: Track[] } }
  | { ok: false; error: { code: string; message: string } };

export default function ArtistPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = React.useState<Res | null>(null);

  React.useEffect(() => {
    const ac = new AbortController();
    const run = async () => {
      const res = await fetch(`/api/music/artist?id=${encodeURIComponent(id)}`, { signal: ac.signal });
      const json = (await res.json()) as Res;
      setData(json);
      if (!json.ok) toast.error("加载失败", { description: json.error.code });
    };
    void run().catch(() => {});
    return () => ac.abort();
  }, [id]);

  if (!data) {
    return (
      <Card>
        <div className="text-sm text-black/70 dark:text-white/70">加载中…</div>
      </Card>
    );
  }
  if (!data.ok) {
    return (
      <Card>
        <div className="text-sm font-medium">歌手不可用</div>
        <div className="mt-1 text-sm text-black/70 dark:text-white/70">{data.error.message}</div>
      </Card>
    );
  }

  const artist = data.data;
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="relative h-40 w-40 overflow-hidden rounded-3xl bg-black/5 dark:bg-white/10">
          {artist.picUrl ? <Image src={artist.picUrl} alt={artist.name} fill className="object-cover" /> : null}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{artist.name}</h1>
          <div className="mt-2 line-clamp-2 text-sm text-black/70 dark:text-white/70">{artist.briefDesc ?? ""}</div>
          <div className="mt-4">
            <Button
              onClick={() => usePlayerStore.getState().setQueue(artist.tracks, 0, true)}
              disabled={!artist.tracks.length}
            >
              播放热门
            </Button>
          </div>
        </div>
      </div>

      <Card className="mt-6 p-0">
        <div className="px-4 py-3 text-sm font-medium">热门歌曲</div>
        <div className="divide-y divide-black/5 dark:divide-white/10">
          {artist.tracks.map((t, idx) => (
            <button
              key={`${t.id}-${idx}`}
              type="button"
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => usePlayerStore.getState().setQueue(artist.tracks, idx, true)}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {idx + 1}. {t.name}
                </div>
                <div className="truncate text-xs text-black/60 dark:text-white/60">{t.artists.map((a) => a.name).join(" / ")}</div>
              </div>
              <div className="text-xs text-black/50 dark:text-white/50">播放</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

