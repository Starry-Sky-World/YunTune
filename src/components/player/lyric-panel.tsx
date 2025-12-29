"use client";

import * as React from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { findActiveLineIndex, parseLrc, type LrcLine } from "@/lib/lyric/parseLrc";
import { usePlayerStore } from "@/store/player";

type LyricRes =
  | { ok: true; data: { id: number; lrc: string; tlyric: string; nolyric: boolean; pureMusic: boolean } }
  | { ok: false; error: { code: string; message: string } };

type ViewLine = { timeSec: number; text: string; subText?: string };

function toCs(sec: number) {
  return Math.round(sec * 100);
}

function mergeLyric(main: LrcLine[], translated: LrcLine[]): ViewLine[] {
  const tMap = new Map<number, string>();
  for (const l of translated) {
    const key = toCs(l.timeSec);
    if (!tMap.has(key) && l.text) tMap.set(key, l.text);
  }
  return main.map((l) => {
    const subText = tMap.get(toCs(l.timeSec));
    return { timeSec: l.timeSec, text: l.text, subText: subText && subText !== l.text ? subText : undefined };
  });
}

export function LyricPanel({ className }: { className?: string }) {
  const track = usePlayerStore((s) => s.currentTrack());
  const time = usePlayerStore((s) => s.progressSec);

  const [lines, setLines] = React.useState<ViewLine[]>([]);
  const [meta, setMeta] = React.useState<{ nolyric: boolean; pureMusic: boolean } | null>(null);
  const [manualScroll, setManualScroll] = React.useState(false);

  const activeIdx = React.useMemo(
    () => findActiveLineIndex(lines.map((l) => ({ timeSec: l.timeSec, text: l.text })), time),
    [lines, time],
  );
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const lineRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

  React.useEffect(() => {
    if (!track) {
      setLines([]);
      setMeta(null);
      return;
    }
    const ac = new AbortController();
    const run = async () => {
      const res = await fetch(`/api/music/lyric?id=${track.id}`, { signal: ac.signal });
      const json = (await res.json()) as LyricRes;
      if (!json.ok) {
        setLines([]);
        setMeta(null);
        return;
      }
      setMeta({ nolyric: json.data.nolyric, pureMusic: json.data.pureMusic });
      const main = parseLrc(json.data.lrc || "");
      const translated = parseLrc(json.data.tlyric || "");
      setLines(mergeLyric(main, translated));
    };
    void run();
    return () => ac.abort();
  }, [track?.id]);

  React.useEffect(() => {
    if (manualScroll) return;
    const el = lineRefs.current.get(activeIdx);
    const container = containerRef.current;
    if (!el || !container) return;
    const top = el.offsetTop - container.clientHeight * 0.4;
    container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [activeIdx, manualScroll]);

  return (
    <Card className={cn("relative overflow-hidden p-0", className)}>
      <div
        ref={containerRef}
        className="max-h-[62vh] overflow-auto px-4 py-10"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
          maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
        }}
        onScroll={() => {
          setManualScroll(true);
          window.clearTimeout((LyricPanel as any)._t);
          (LyricPanel as any)._t = window.setTimeout(() => setManualScroll(false), 2500);
        }}
      >
        {!track ? (
          <div className="py-10 text-center text-sm text-black/60 dark:text-white/60">暂无歌曲</div>
        ) : lines.length === 0 ? (
          <div className="py-10 text-center text-sm text-black/60 dark:text-white/60">
            {meta?.pureMusic ? "纯音乐，请欣赏" : "暂无歌词"}
          </div>
        ) : (
          <div className="space-y-5 text-center">
            {lines.map((l, idx) => {
              const active = idx === activeIdx;
              return (
                <div
                  key={`${l.timeSec}-${idx}`}
                  ref={(node) => {
                    if (!node) return;
                    lineRefs.current.set(idx, node);
                  }}
                >
                  <button
                    type="button"
                    aria-current={active}
                    className={cn(
                      "w-full select-none rounded-2xl px-2 py-1 text-balance transition-all will-change-transform",
                      active
                        ? "scale-[1.02] text-[22px] font-semibold leading-snug text-black dark:text-white sm:text-[24px]"
                        : "text-[16px] font-medium leading-snug text-black/45 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70",
                    )}
                    onClick={() => {
                      usePlayerStore.setState({ progressSec: l.timeSec });
                      window.dispatchEvent(new CustomEvent("yuntune-seek", { detail: l.timeSec }));
                      setManualScroll(false);
                    }}
                  >
                    {l.text || "…"}
                  </button>
                  {l.subText ? (
                    <div
                      className={cn(
                        "mt-1 text-sm leading-snug",
                        active ? "text-black/70 dark:text-white/70" : "text-black/35 dark:text-white/35",
                      )}
                    >
                      {l.subText}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {manualScroll ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <Button
            className="pointer-events-auto shadow"
            size="sm"
            variant="secondary"
            onClick={() => setManualScroll(false)}
          >
            <ArrowDown className="h-4 w-4" />
            回到当前行
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
