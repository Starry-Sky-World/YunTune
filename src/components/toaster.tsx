"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border border-black/10 bg-white/80 text-black shadow-lg backdrop-blur dark:border-white/10 dark:bg-black/60 dark:text-white",
          title: "text-sm font-medium",
          description: "text-sm text-black/70 dark:text-white/70",
        },
      }}
    />
  );
}

