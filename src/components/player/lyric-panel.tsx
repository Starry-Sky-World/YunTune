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

export function LyricPanel() {
  const track = usePlayerStore((s) => s.currentTrack());
  const time = usePlayerStore((s) => s.progressSec);

  const [lines, setLines] = React.useState<LrcLine[]>([]);
  const [meta, setMeta] = React.useState<{ nolyric: boolean; pureMusic: boolean } | null>(null);
  const [manualScroll, setManualScroll] = React.useState(false);

  const activeIdx = React.useMemo(() => findActiveLineIndex(lines, time), [lines, time]);
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
      setLines(parseLrc(json.data.lrc || ""));
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
    <Card className="relative p-0">
      <div
        ref={containerRef}
        className="max-h-[55vh] overflow-auto px-4 py-5"
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
          <div className="space-y-3">
            {lines.map((l, idx) => (
              <div
                key={`${l.timeSec}-${idx}`}
                ref={(node) => {
                  if (!node) return;
                  lineRefs.current.set(idx, node);
                }}
                className={cn(
                  "text-sm leading-relaxed transition",
                  idx === activeIdx ? "text-black dark:text-white" : "text-black/45 dark:text-white/45",
                )}
              >
                {l.text || "…"}
              </div>
            ))}
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

