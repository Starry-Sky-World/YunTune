"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl bg-black/5 px-4 text-sm outline-none",
        "placeholder:text-black/40 focus:ring-2 focus:ring-black/15",
        "dark:bg-white/10 dark:placeholder:text-white/40 dark:focus:ring-white/15",
        className,
      )}
      {...props}
    />
  );
}

