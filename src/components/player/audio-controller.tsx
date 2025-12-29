"use client";

import * as React from "react";
import { toast } from "sonner";
import { usePlayerStore } from "@/store/player";
import type { Track } from "@/lib/types/music";

type SongUrlRes = { ok: true; data: { id: number; url: string } } | { ok: false; error: { code: string; message: string } };

function artistText(track: Track) {
  return track.artists.map((a) => a.name).filter(Boolean).join(" / ");
}

export function AudioController() {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const track = usePlayerStore((s) => s.currentTrack());
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);

  const setAudio = usePlayerStore((s) => s._setAudio);
  const setUrl = usePlayerStore((s) => s._setUrl);
  const setError = usePlayerStore((s) => s._setError);

  React.useEffect(() => {
    const el = new Audio();
    el.preload = "metadata";
    el.crossOrigin = "anonymous";
    audioRef.current = el;

    const onTime = () => setAudio({ progressSec: el.currentTime });
    const onDuration = () => setAudio({ durationSec: Number.isFinite(el.duration) ? el.duration : 0 });
    const onPlay = () => setAudio({ isPlaying: true });
    const onPause = () => setAudio({ isPlaying: false });
    const onEnded = () => {
      const loopMode = usePlayerStore.getState().loopMode;
      if (loopMode === "one") {
        el.currentTime = 0;
        void el.play();
        return;
      }
      usePlayerStore.getState().next();
    };
    const onSeek = (event: Event) => {
      const sec = (event as CustomEvent<number>).detail;
      if (!Number.isFinite(sec)) return;
      el.currentTime = Math.max(0, sec);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("durationchange", onDuration);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    window.addEventListener("yuntune-seek", onSeek as EventListener);

    return () => {
      el.pause();
      el.src = "";
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("durationchange", onDuration);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      window.removeEventListener("yuntune-seek", onSeek as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
  }, [volume]);

  React.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      void el.play().catch(() => {
        setAudio({ requiresGesture: true });
      });
    } else {
      el.pause();
    }
  }, [isPlaying, setAudio]);

  React.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const updateMediaSession = (t: Track, artworkUrl?: string) => {
      if (!("mediaSession" in navigator)) return;
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: t.name,
          artist: artistText(t),
          album: t.album?.name,
          artwork: artworkUrl ? [{ src: artworkUrl, sizes: "512x512", type: "image/jpeg" }] : [],
        });
        navigator.mediaSession.setActionHandler("previoustrack", () => usePlayerStore.getState().prev());
        navigator.mediaSession.setActionHandler("nexttrack", () => usePlayerStore.getState().next());
        navigator.mediaSession.setActionHandler("play", () => usePlayerStore.getState().togglePlay(true));
        navigator.mediaSession.setActionHandler("pause", () => usePlayerStore.getState().togglePlay(false));
      } catch {
        // ignore
      }
    };

    if (!track) {
      el.pause();
      el.src = "";
      setUrl(undefined);
      return;
    }

    const ac = new AbortController();
    const run = async () => {
      setError(undefined);
      setAudio({ progressSec: 0, durationSec: 0, requiresGesture: false });

      const res = await fetch(`/api/music/song/url?id=${track.id}&level=standard`, { signal: ac.signal });
      const json = (await res.json()) as SongUrlRes;
      if (!json.ok) {
        setError(json.error.message);
        toast.error("无法播放", { description: json.error.code });
        usePlayerStore.getState().togglePlay(false);
        return;
      }

      el.src = json.data.url;
      setUrl(json.data.url);
      updateMediaSession(track, track.album?.picUrl);

      if (usePlayerStore.getState().isPlaying) {
        try {
          await el.play();
        } catch {
          setAudio({ requiresGesture: true });
        }
      }
    };
    void run();

    return () => ac.abort();
  }, [track?.id, setAudio, setError, setUrl, track]);

  return null;
}
