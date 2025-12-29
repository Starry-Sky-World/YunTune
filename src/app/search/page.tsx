"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/store/player";
import type { Track } from "@/lib/types/music";

type SearchRes =
  | { ok: true; data: { type: number; songs?: Track[]; songCount?: number; result?: any } }
  | { ok: false; error: { code: string; message: string } };

const TABS = [
  { value: "1", label: "单曲" },
  { value: "10", label: "专辑" },
  { value: "100", label: "歌手" },
  { value: "1000", label: "歌单" },
  { value: "1004", label: "MV" },
];

export default function SearchPage() {
  const [keywords, setKeywords] = React.useState("");
  const [tab, setTab] = React.useState("1");
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<SearchRes | null>(null);

  const onSearch = React.useCallback(async () => {
    const q = keywords.trim();
    if (!q) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/music/search?keywords=${encodeURIComponent(q)}&type=${tab}&limit=20`);
      const json = (await res.json()) as SearchRes;
      setData(json);
      if (!json.ok) toast.error("搜索失败", { description: json.error.code });
    } finally {
      setLoading(false);
    }
  }, [keywords, tab]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">搜索</h1>
      <div className="mt-4 flex items-center gap-2">
        <Input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="搜索歌曲/歌手/专辑/歌单…"
          onKeyDown={(e) => {
            if (e.key === "Enter") void onSearch();
          }}
        />
        <Button onClick={() => void onSearch()} disabled={loading}>
          {loading ? "搜索中…" : "搜索"}
        </Button>
      </div>

      <div className="mt-4">
        <Tabs tabs={TABS} value={tab} onValueChange={setTab} />
      </div>

      <div className="mt-6">
        {!data ? (
          <Card>
            <div className="text-sm text-black/70 dark:text-white/70">输入关键词开始搜索。</div>
          </Card>
        ) : !data.ok ? (
          <Card>
            <div className="text-sm font-medium">搜索失败</div>
            <div className="mt-1 text-sm text-black/70 dark:text-white/70">{data.error.message}</div>
          </Card>
        ) : tab === "1" ? (
          <Card className="p-0">
            <div className="px-4 py-3 text-sm font-medium">单曲（{data.data.songCount ?? 0}）</div>
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {(data.data.songs ?? []).map((t, idx) => (
                <button
                  key={`${t.id}-${idx}`}
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() => usePlayerStore.getState().setQueue([t], 0, true)}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{t.name}</div>
                    <div className="truncate text-xs text-black/60 dark:text-white/60">
                      {t.artists.map((a) => a.name).join(" / ")}
                    </div>
                  </div>
                  <div className="text-xs text-black/50 dark:text-white/50">播放</div>
                </button>
              ))}
            </div>
          </Card>
        ) : tab === "1000" ? (
          <Card className="p-0">
            <div className="px-4 py-3 text-sm font-medium">歌单</div>
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {(data.data.result?.playlists ?? []).map((p: any) => (
                <Link
                  key={p.id}
                  href={`/playlist/${p.id}`}
                  className="block px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="mt-1 text-xs text-black/60 dark:text-white/60">共 {p.trackCount} 首</div>
                </Link>
              ))}
            </div>
          </Card>
        ) : tab === "10" ? (
          <Card className="p-0">
            <div className="px-4 py-3 text-sm font-medium">专辑</div>
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {(data.data.result?.albums ?? []).map((a: any) => (
                <Link key={a.id} href={`/album/${a.id}`} className="block px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10">
                  <div className="truncate text-sm font-medium">{a.name}</div>
                  <div className="mt-1 text-xs text-black/60 dark:text-white/60">{a.artist?.name}</div>
                </Link>
              ))}
            </div>
          </Card>
        ) : tab === "100" ? (
          <Card className="p-0">
            <div className="px-4 py-3 text-sm font-medium">歌手</div>
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {(data.data.result?.artists ?? []).map((a: any) => (
                <Link key={a.id} href={`/artist/${a.id}`} className="block px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10">
                  <div className="truncate text-sm font-medium">{a.name}</div>
                  <div className="mt-1 text-xs text-black/60 dark:text-white/60">ID {a.id}</div>
                </Link>
              ))}
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-sm font-medium">MV</div>
            <div className="mt-1 text-sm text-black/70 dark:text-white/70">
              MVP 先展示列表（播放链路可能不稳定，可后续补）。共 {data.data.result?.mvCount ?? 0} 条
            </div>
            <div className="mt-4 space-y-2">
              {(data.data.result?.mvs ?? []).slice(0, 10).map((mv: any) => (
                <Link key={mv.id} href={`/mv/${mv.id}`} className="block rounded-2xl bg-black/5 px-4 py-3 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15">
                  <div className="truncate text-sm font-medium">{mv.name}</div>
                  <div className="mt-1 text-xs text-black/60 dark:text-white/60">{mv.artistName}</div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
