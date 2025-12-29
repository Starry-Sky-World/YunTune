export type LrcLine = { timeSec: number; text: string };

function parseTimeToSec(raw: string): number | null {
  const m = raw.match(/^(\d+):(\d+)(?:\.(\d+))?$/);
  if (!m) return null;
  const min = Number(m[1]);
  const sec = Number(m[2]);
  const msRaw = m[3] ?? "0";
  const ms = Number((msRaw + "00").slice(0, 2));
  if (!Number.isFinite(min) || !Number.isFinite(sec) || !Number.isFinite(ms)) return null;
  return min * 60 + sec + ms / 100;
}

export function parseLrc(lrc: string): LrcLine[] {
  const lines: LrcLine[] = [];
  for (const rawLine of lrc.split(/\r?\n/)) {
    const timeTags = [...rawLine.matchAll(/\[(\d+:\d+(?:\.\d+)?)\]/g)].map((m) => m[1]).filter(Boolean);
    if (timeTags.length === 0) continue;
    const text = rawLine.replace(/\[[^\]]+\]/g, "").trim();
    for (const tag of timeTags) {
      const t = parseTimeToSec(tag);
      if (t == null) continue;
      lines.push({ timeSec: t, text });
    }
  }
  lines.sort((a, b) => a.timeSec - b.timeSec);
  return lines;
}

export function findActiveLineIndex(lines: LrcLine[], timeSec: number): number {
  if (lines.length === 0) return -1;
  let lo = 0;
  let hi = lines.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const t = lines[mid]!.timeSec;
    if (t <= timeSec) lo = mid + 1;
    else hi = mid - 1;
  }
  return Math.max(0, Math.min(lines.length - 1, lo - 1));
}

