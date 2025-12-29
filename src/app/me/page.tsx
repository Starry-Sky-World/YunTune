"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RECENT_STORAGE_KEY, type RecentTrack } from "@/components/player/recent-tracker";

type MeRes =
  | { ok: true; data: { userId: number; nickname?: string; avatarUrl?: string } }
  | { ok: false; error: { code: string; message: string } };

type PlaylistsRes =
  | { ok: true; data: { uid: number; playlists: { id: number; name: string; coverImgUrl?: string; trackCount?: number }[] } }
  | { ok: false; error: { code: string; message: string } };

type LikeRes = { ok: true; data: { uid: number; ids: number[] } } | { ok: false; error: { code: string; message: string } };

function safeReadRecent(): RecentTrack[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentTrack[];
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch {
    return [];
  }
}

export default function MePage() {
  const [me, setMe] = React.useState<MeRes | null>(null);
  const [playlists, setPlaylists] = React.useState<PlaylistsRes | null>(null);
  const [likes, setLikes] = React.useState<LikeRes | null>(null);
  const [recent, setRecent] = React.useState<RecentTrack[]>([]);

  React.useEffect(() => setRecent(safeReadRecent()), []);

  React.useEffect(() => {
    const ac = new AbortController();
    const run = async () => {
      const res = await fetch("/api/me", { signal: ac.signal });
      const json = (await res.json()) as MeRes;
      setMe(json);
      if (!json.ok) return;

      const [plRes, likeRes] = await Promise.all([
        fetch(`/api/music/user/playlist?uid=${json.data.userId}`, { signal: ac.signal }).then((r) => r.json()) as Promise<PlaylistsRes>,
        fetch(`/api/music/likelist?uid=${json.data.userId}`, { signal: ac.signal }).then((r) => r.json()) as Promise<LikeRes>,
      ]);
      setPlaylists(plRes);
      setLikes(likeRes);
    };
    void run().catch(() => {});
    return () => ac.abort();
  }, []);

  if (!me) {
    return (
      <Card>
        <div className="text-sm text-black/70 dark:text-white/70">加载中…</div>
      </Card>
    );
  }

  if (!me.ok) {
    return (
      <Card>
        <div className="text-sm font-medium">未登录</div>
        <div className="mt-1 text-sm text-black/70 dark:text-white/70">登录后可查看我的歌单与每日推荐。</div>
        <div className="mt-4">
          <Link href="/login">
            <Button>去登录</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="flex items-center gap-4">
        {me.data.avatarUrl ? (
          <Image src={me.data.avatarUrl} alt={me.data.nickname ?? "avatar"} width={56} height={56} className="h-14 w-14 rounded-3xl" />
        ) : (
          <div className="h-14 w-14 rounded-3xl bg-black/10 dark:bg-white/10" />
        )}
        <div className="min-w-0">
          <div className="truncate text-base font-semibold tracking-tight">{me.data.nickname ?? `UID ${me.data.userId}`}</div>
          <div className="mt-1 text-sm text-black/60 dark:text-white/60">
            我喜欢：{likes && likes.ok ? `${likes.data.ids.length} 首` : "—"}
          </div>
        </div>
        <div className="flex-1" />
        <Button
          variant="secondary"
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", { method: "POST" });
              toast.success("已退出登录");
              setMe({ ok: false, error: { code: "LOGIN_REQUIRED", message: "Login required" } });
            } catch {
              toast.error("退出失败");
            }
          }}
        >
          退出
        </Button>
      </Card>

      <Card className="p-0">
        <div className="px-4 py-3 text-sm font-medium">我的歌单</div>
        <div className="divide-y divide-black/5 dark:divide-white/10">
          {playlists && playlists.ok ? (
            playlists.data.playlists.map((p) => (
              <Link key={p.id} href={`/playlist/${p.id}`} className="block px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10">
                <div className="truncate text-sm font-medium">{p.name}</div>
                <div className="mt-1 text-xs text-black/60 dark:text-white/60">{p.trackCount ?? "—"} 首</div>
              </Link>
            ))
          ) : (
            <div className="px-4 py-6 text-sm text-black/60 dark:text-white/60">暂不可用</div>
          )}
        </div>
      </Card>

      <Card className="p-0">
        <div className="px-4 py-3 text-sm font-medium">最近播放（本地）</div>
        <div className="divide-y divide-black/5 dark:divide-white/10">
          {recent.length === 0 ? (
            <div className="px-4 py-6 text-sm text-black/60 dark:text-white/60">暂无</div>
          ) : (
            recent.map((t) => (
              <div key={t.playedAt} className="px-4 py-3">
                <div className="truncate text-sm font-medium">{t.name}</div>
                <div className="mt-1 truncate text-xs text-black/60 dark:text-white/60">{t.artists.map((a) => a.name).join(" / ")}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

