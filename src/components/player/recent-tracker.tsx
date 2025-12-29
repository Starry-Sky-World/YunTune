"use client";

import * as React from "react";
import { usePlayerStore } from "@/store/player";
import type { Track } from "@/lib/types/music";

export type RecentTrack = Track & { playedAt: number };

const KEY = "yuntune_recent_v1";

function safeRead(): RecentTrack[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentTrack[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t) => typeof t?.id === "number").slice(0, 50);
  } catch {
    return [];
  }
}

function safeWrite(list: RecentTrack[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    // ignore
  }
}

export function RecentTracker() {
  React.useEffect(() => {
    let lastId: number | null = null;
    const unsub = usePlayerStore.subscribe(
      (s) => s.currentTrack()?.id,
      (id: number | undefined) => {
        if (!id || id === lastId) return;
        lastId = id;
        const track = usePlayerStore.getState().currentTrack();
        if (!track) return;
        const prev = safeRead();
        const next: RecentTrack[] = [
          { ...track, playedAt: Date.now() },
          ...prev.filter((t) => t.id !== track.id),
        ];
        safeWrite(next);
      },
    );
    return () => unsub();
  }, []);
  return null;
}

export { KEY as RECENT_STORAGE_KEY };
