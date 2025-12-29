"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Track } from "@/lib/types/music";

export type LoopMode = "order" | "one" | "all";

type PlayerState = {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  durationSec: number;
  progressSec: number;
  volume: number;
  loopMode: LoopMode;
  currentUrl?: string;
  requiresGesture: boolean;
  lastError?: string;

  currentTrack: () => Track | null;
  setQueue: (queue: Track[], startIndex?: number, autoplay?: boolean) => void;
  addToQueue: (tracks: Track[] | Track) => void;
  clearQueue: () => void;
  playIndex: (index: number) => void;
  togglePlay: (next?: boolean) => void;
  next: () => void;
  prev: () => void;
  setVolume: (volume: number) => void;
  setLoopMode: (mode: LoopMode) => void;
  setProgress: (sec: number) => void;

  _setAudio: (patch: Partial<Pick<PlayerState, "durationSec" | "progressSec" | "isPlaying" | "requiresGesture">>) => void;
  _setUrl: (url?: string) => void;
  _setError: (msg?: string) => void;
};

export const usePlayerStore = create<PlayerState>()(
  subscribeWithSelector((set, get) => ({
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  durationSec: 0,
  progressSec: 0,
  volume: 1,
  loopMode: "order",
  currentUrl: undefined,
  requiresGesture: false,
  lastError: undefined,

  currentTrack: () => get().queue[get().currentIndex] ?? null,

  setQueue: (queue, startIndex = 0, autoplay = true) =>
    set({
      queue,
      currentIndex: Math.max(0, Math.min(startIndex, Math.max(0, queue.length - 1))),
      isPlaying: autoplay,
      progressSec: 0,
      durationSec: 0,
      requiresGesture: false,
      lastError: undefined,
    }),

  addToQueue: (tracks) =>
    set((s) => ({ queue: s.queue.concat(Array.isArray(tracks) ? tracks : [tracks]) })),

  clearQueue: () => set({ queue: [], currentIndex: 0, isPlaying: false, progressSec: 0, durationSec: 0 }),

  playIndex: (index) =>
    set((s) => ({
      currentIndex: Math.max(0, Math.min(index, Math.max(0, s.queue.length - 1))),
      isPlaying: true,
      progressSec: 0,
      durationSec: 0,
      requiresGesture: false,
      lastError: undefined,
    })),

  togglePlay: (next) =>
    set((s) => ({ isPlaying: typeof next === "boolean" ? next : !s.isPlaying, requiresGesture: false })),

  next: () =>
    set((s) => {
      if (s.queue.length === 0) return {};
      if (s.loopMode === "one") return { progressSec: 0, isPlaying: true };
      const nextIndex =
        s.currentIndex + 1 < s.queue.length ? s.currentIndex + 1 : s.loopMode === "all" ? 0 : s.currentIndex;
      const shouldAdvance = nextIndex !== s.currentIndex;
      return shouldAdvance
        ? { currentIndex: nextIndex, isPlaying: true, progressSec: 0, durationSec: 0, requiresGesture: false }
        : { isPlaying: false };
    }),

  prev: () =>
    set((s) => {
      if (s.queue.length === 0) return {};
      if (s.progressSec > 3) return { progressSec: 0 };
      const prevIndex = s.currentIndex > 0 ? s.currentIndex - 1 : s.loopMode === "all" ? s.queue.length - 1 : 0;
      return { currentIndex: prevIndex, isPlaying: true, progressSec: 0, durationSec: 0, requiresGesture: false };
    }),

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setLoopMode: (mode) => set({ loopMode: mode }),
  setProgress: (sec) => set({ progressSec: Math.max(0, sec) }),

  _setAudio: (patch) => set(patch),
  _setUrl: (url) => set({ currentUrl: url }),
  _setError: (msg) => set({ lastError: msg }),
})),
);
