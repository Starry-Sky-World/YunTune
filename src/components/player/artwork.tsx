"use client";

import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Artwork({
  src,
  alt,
  size,
  className,
  rounded = "rounded-2xl",
}: {
  src?: string;
  alt: string;
  size: number;
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden bg-black/10 dark:bg-white/10", rounded, className)}
      style={{ width: size, height: size }}
      aria-hidden={!src}
    >
      {src ? <Image src={src} alt={alt} fill className="object-cover" sizes={`${size}px`} /> : null}
    </div>
  );
}

