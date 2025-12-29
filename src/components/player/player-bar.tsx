"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ListMusic, Pause, Play, Repeat, Repeat1, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Artwork } from "@/components/player/artwork";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/player";

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PlayerBar() {
  const router = useRouter();
  const track = usePlayerStore((s) => s.currentTrack());
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const progressSec = usePlayerStore((s) => s.progressSec);
  const durationSec = usePlayerStore((s) => s.durationSec);
  const volume = usePlayerStore((s) => s.volume);
  const loopMode = usePlayerStore((s) => s.loopMode);
  const requiresGesture = usePlayerStore((s) => s.requiresGesture);
  const lastError = usePlayerStore((s) => s.lastError);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const prev = usePlayerStore((s) => s.prev);
  const next = usePlayerStore((s) => s.next);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const setLoopMode = usePlayerStore((s) => s.setLoopMode);
  const setProgress = usePlayerStore((s) => s.setProgress);

  const [queueOpen, setQueueOpen] = React.useState(false);

  const progress = durationSec > 0 ? Math.min(1, progressSec / durationSec) : 0;
  const loopIcon = loopMode === "one" ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-black/50">
      <div className="mx-auto max-w-5xl px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={cn("min-w-0 flex-1 text-left", !track && "pointer-events-none opacity-60")}
            onClick={() => router.push("/player")}
          >
            <div className="flex items-center gap-3">
              <Artwork src={track?.album?.picUrl} alt={track?.album?.name ?? track?.name ?? "Artwork"} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{track?.name ?? "未在播放"}</div>
                <div className="truncate text-xs text-black/60 dark:text-white/60">
                  {track ? track.artists.map((a) => a.name).join(" / ") : "选择一首歌开始播放"}
                </div>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={prev} aria-label="Previous">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              onClick={() => togglePlay()}
              aria-label={isPlaying ? "Pause" : "Play"}
              disabled={!track}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={next} aria-label="Next">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <Link href="/player" aria-label="Lyrics">
            <Button variant="ghost" size="icon">
              <FileText className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setQueueOpen((v) => !v)} aria-label="Queue">
            <ListMusic className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="w-12 shrink-0 text-[11px] tabular-nums text-black/60 dark:text-white/60">
            {formatTime(progressSec)}
          </div>
          <input
            aria-label="Seek"
            type="range"
            min={0}
            max={Math.max(1, durationSec)}
            step={0.25}
            value={Math.min(durationSec, progressSec)}
            onChange={(e) => setProgress(Number(e.target.value))}
            onPointerUp={(e) => {
              const el = e.currentTarget as HTMLInputElement;
              const t = Number(el.value);
              // Audio element listens via timeupdate; we mirror via store only. Seek is handled in /player page.
              usePlayerStore.setState({ progressSec: t });
              window.dispatchEvent(new CustomEvent("yuntune-seek", { detail: t }));
            }}
            className="h-1 w-full cursor-pointer accent-black dark:accent-white"
          />
          <div className="w-12 shrink-0 text-right text-[11px] tabular-nums text-black/60 dark:text-white/60">
            {formatTime(durationSec)}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-black/60 dark:text-white/60">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLoopMode(loopMode === "order" ? "all" : loopMode === "all" ? "one" : "order")}
              aria-label="Loop mode"
              title="循环模式"
            >
              {loopIcon}
            </Button>
            <div className="hidden sm:block">
              {loopMode === "order" ? "顺序" : loopMode === "all" ? "列表循环" : "单曲循环"}
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Volume2 className="h-4 w-4" />
            <input
              aria-label="Volume"
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-24 cursor-pointer accent-black dark:accent-white"
            />
          </div>

          <div className={cn(requiresGesture || lastError ? "text-amber-600 dark:text-amber-300" : "opacity-0")}>
            {lastError ? (
              <span className="truncate">播放失败：{lastError}</span>
            ) : requiresGesture ? (
              <span>
                需要点击播放 <Link className="underline underline-offset-4" href="/player">打开播放器</Link>
              </span>
            ) : (
              "—"
            )}
          </div>
        </div>

        {queueOpen ? <PlayerQueue onClose={() => setQueueOpen(false)} /> : null}
      </div>
    </div>
  );
}

function PlayerQueue({ onClose }: { onClose: () => void }) {
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const playIndex = usePlayerStore((s) => s.playIndex);
  const clear = usePlayerStore((s) => s.clearQueue);
  return (
    <div className="mt-3 rounded-3xl border border-black/10 bg-white/70 p-3 backdrop-blur dark:border-white/10 dark:bg-black/40">
      <div className="flex items-center justify-between gap-3 px-2 py-1">
        <div className="text-sm font-medium">队列</div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clear}>
            清空
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
      <div className="max-h-56 overflow-auto">
        {queue.length === 0 ? (
          <div className="px-2 py-8 text-center text-sm text-black/60 dark:text-white/60">暂无歌曲</div>
        ) : (
          <div className="space-y-1">
            {queue.map((t, idx) => (
              <button
                key={`${t.id}-${idx}`}
                type="button"
                onClick={() => playIndex(idx)}
                className={cn(
                  "w-full rounded-2xl px-3 py-2 text-left text-sm transition",
                  idx === currentIndex
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-black/5 dark:hover:bg-white/10",
                )}
              >
                <div className="truncate font-medium">{t.name}</div>
                <div className="truncate text-xs opacity-70">{t.artists.map((a) => a.name).join(" / ")}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
