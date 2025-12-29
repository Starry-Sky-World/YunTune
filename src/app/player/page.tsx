"use client";

import * as React from "react";
import { ChevronLeft, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LyricPanel } from "@/components/player/lyric-panel";
import { usePlayerStore } from "@/store/player";

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function PlayerPage() {
  const router = useRouter();
  const track = usePlayerStore((s) => s.currentTrack());
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const progressSec = usePlayerStore((s) => s.progressSec);
  const durationSec = usePlayerStore((s) => s.durationSec);
  const requiresGesture = usePlayerStore((s) => s.requiresGesture);

  const toggle = usePlayerStore((s) => s.togglePlay);
  const prev = usePlayerStore((s) => s.prev);
  const next = usePlayerStore((s) => s.next);

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-sm font-medium">{track?.name ?? "未在播放"}</div>
          <div className="truncate text-xs text-black/60 dark:text-white/60">
            {track ? track.artists.map((a) => a.name).join(" / ") : "—"}
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="mt-6 rounded-[32px] border border-black/10 bg-black/5 p-6 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={prev} aria-label="Previous">
            <SkipBack className="h-6 w-6" />
          </Button>
          <Button size="icon" className="h-14 w-14" onClick={() => toggle()} disabled={!track}>
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={next} aria-label="Next">
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-5 flex items-center gap-3">
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
            onChange={(e) => {
              const t = Number(e.target.value);
              usePlayerStore.setState({ progressSec: t });
              window.dispatchEvent(new CustomEvent("yuntune-seek", { detail: t }));
            }}
            className="h-1 w-full cursor-pointer accent-black dark:accent-white"
          />
          <div className="w-12 shrink-0 text-right text-[11px] tabular-nums text-black/60 dark:text-white/60">
            {formatTime(durationSec)}
          </div>
        </div>

        {requiresGesture ? (
          <div className="mt-3 text-center text-xs text-amber-700 dark:text-amber-300">
            浏览器限制自动播放：请点击播放按钮开始播放
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <LyricPanel />
      </div>
    </div>
  );
}
