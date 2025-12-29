"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Tab = { value: string; label: string };

export function Tabs({
  tabs,
  value,
  onValueChange,
}: {
  tabs: Tab[];
  value: string;
  onValueChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onValueChange(t.value)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm transition",
            value === t.value
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "bg-black/5 text-black hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

