"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Radio, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/store/player";
import type { Track } from "@/lib/types/music";

type Section<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };
type DiscoverRes =
  | {
      ok: true;
      data: {
        personalized: Section<{ id: number; name: string; picUrl?: string; playCount?: number }[]>;
        toplist: Section<{ id: number; name: string; coverImgUrl?: string; updateFrequency?: string }[]>;
        daily: Section<{ id: number; name: string; picUrl?: string }[]>;
        fm: Section<Track[]>;
      };
    }
  | { ok: false; error: { code: string; message: string } };

export default function HomePage() {
  const [data, setData] = React.useState<DiscoverRes | null>(null);

  React.useEffect(() => {
    const ac = new AbortController();
    const run = async () => {
      const res = await fetch("/api/music/discover", { signal: ac.signal });
      const json = (await res.json()) as DiscoverRes;
      setData(json);
    };
    void run().catch(() => {});
    return () => ac.abort();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">发现</h1>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">推荐歌单、榜单、每日推荐与私人 FM。</p>
        </div>
        <Link href="/search" className="sm:hidden">
          <Button variant="secondary" size="sm">
            搜索
          </Button>
        </Link>
      </div>

      <SectionBlock
        title="推荐歌单"
        icon={<Sparkles className="h-4 w-4" />}
        section={data?.ok ? data.data.personalized : null}
        render={(list) => (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {list.slice(0, 8).map((p) => (
              <Link key={p.id} href={`/playlist/${p.id}`}>
                <Card className="p-3">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-black/5 dark:bg-white/10">
                    {p.picUrl ? <Image src={p.picUrl} alt={p.name} fill className="object-cover" /> : null}
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm font-medium">{p.name}</div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      />

      <SectionBlock
        title="榜单"
        section={data?.ok ? data.data.toplist : null}
        render={(list) => (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {list.slice(0, 8).map((t) => (
              <Link key={t.id} href={`/playlist/${t.id}`}>
                <Card className="p-3">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-black/5 dark:bg-white/10">
                    {t.coverImgUrl ? <Image src={t.coverImgUrl} alt={t.name} fill className="object-cover" /> : null}
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm font-medium">{t.name}</div>
                  <div className="mt-1 text-xs text-black/60 dark:text-white/60">{t.updateFrequency ?? ""}</div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      />

      <SectionBlock
        title="每日推荐"
        section={data?.ok ? data.data.daily : null}
        hint="需要登录"
        render={(list) => (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {list.slice(0, 8).map((p) => (
              <Link key={p.id} href={`/playlist/${p.id}`}>
                <Card className="p-3">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-black/5 dark:bg-white/10">
                    {p.picUrl ? <Image src={p.picUrl} alt={p.name} fill className="object-cover" /> : null}
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm font-medium">{p.name}</div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      />

      <SectionBlock
        title="私人 FM"
        icon={<Radio className="h-4 w-4" />}
        section={data?.ok ? data.data.fm : null}
        hint="需要登录"
        render={(list) => (
          <Card className="p-0">
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {list.slice(0, 10).map((t, idx) => (
                <button
                  key={`${t.id}-${idx}`}
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() => usePlayerStore.getState().setQueue(list, idx, true)}
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
        )}
      />
    </div>
  );
}

function SectionBlock<T>({
  title,
  icon,
  hint,
  section,
  render,
}: {
  title: string;
  icon?: React.ReactNode;
  hint?: string;
  section: Section<T> | null;
  render: (data: T) => React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {title}
        </div>
        {hint ? <div className="text-xs text-black/50 dark:text-white/50">{hint}</div> : null}
      </div>

      {!section ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-3xl" />
          ))}
        </div>
      ) : section.ok ? (
        render(section.data)
      ) : (
        <Card>
          <div className="text-sm text-black/70 dark:text-white/70">
            暂不可用（{section.error.code}）
          </div>
          {section.error.code === "LOGIN_REQUIRED" ? (
            <div className="mt-3">
              <Link href="/login">
                <Button size="sm">去登录</Button>
              </Link>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}
