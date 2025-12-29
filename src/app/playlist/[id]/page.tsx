"use client";

import * as React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PlaylistDetail } from "@/lib/types/music";
import { usePlayerStore } from "@/store/player";

type Res = { ok: true; data: PlaylistDetail } | { ok: false; error: { code: string; message: string } };

export default function PlaylistPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = React.useState<Res | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const ac = new AbortController();
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/music/playlist/detail?id=${encodeURIComponent(id)}`, { signal: ac.signal });
        const json = (await res.json()) as Res;
        setData(json);
        if (!json.ok) toast.error("加载失败", { description: json.error.code });
      } finally {
        setLoading(false);
      }
    };
    void run();
    return () => ac.abort();
  }, [id]);

  if (loading && !data) {
    return (
      <Card>
        <div className="text-sm text-black/70 dark:text-white/70">加载中…</div>
      </Card>
    );
  }

  if (!data || !data.ok) {
    return (
      <Card>
        <div className="text-sm font-medium">歌单不可用</div>
        <div className="mt-1 text-sm text-black/70 dark:text-white/70">{data && !data.ok ? data.error.message : "—"}</div>
      </Card>
    );
  }

  const pl = data.data;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="relative h-40 w-40 overflow-hidden rounded-3xl bg-black/5 dark:bg-white/10">
          {pl.coverImgUrl ? <Image src={pl.coverImgUrl} alt={pl.name} fill className="object-cover" /> : null}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{pl.name}</h1>
          <div className="mt-2 text-sm text-black/70 dark:text-white/70">
            {pl.creatorName ? `by ${pl.creatorName} · ` : null}
            {pl.trackCount ?? pl.tracks.length} 首
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button
              onClick={() => usePlayerStore.getState().setQueue(pl.tracks, 0, true)}
              disabled={pl.tracks.length === 0}
            >
              播放全部
            </Button>
            <Button
              variant="secondary"
              onClick={() => usePlayerStore.getState().addToQueue(pl.tracks)}
              disabled={pl.tracks.length === 0}
            >
              加入队列
            </Button>
          </div>
        </div>
      </div>

      <Card className="mt-6 p-0">
        <div className="px-4 py-3 text-sm font-medium">歌曲</div>
        <div className="divide-y divide-black/5 dark:divide-white/10">
          {pl.tracks.map((t, idx) => (
            <button
              key={`${t.id}-${idx}`}
              type="button"
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => usePlayerStore.getState().setQueue(pl.tracks, idx, true)}
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

