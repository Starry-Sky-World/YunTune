"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { LogIn, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type MeRes =
  | { ok: true; data: { userId: number; nickname?: string; avatarUrl?: string } }
  | { ok: false; error: { code: string; message: string } };

export function UserChip() {
  const [me, setMe] = React.useState<MeRes | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const ac = new AbortController();
    const run = async () => {
      try {
        const res = await fetch("/api/me", { signal: ac.signal });
        const json = (await res.json()) as MeRes;
        setMe(json);
      } catch {
        setMe(null);
      }
    };
    void run();
    return () => ac.abort();
  }, []);

  if (!me || !me.ok) {
    return (
      <Link href="/login">
        <Button variant="secondary" size="sm">
          <LogIn className="h-4 w-4" />
          登录
        </Button>
      </Link>
    );
  }

  const nickname = me.data.nickname || `UID ${me.data.userId}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-black/5 px-3 py-2 text-sm hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
      >
        {me.data.avatarUrl ? (
          <Image
            src={me.data.avatarUrl}
            alt={nickname}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/20 dark:bg-white/20">
            <User className="h-4 w-4" />
          </div>
        )}
        <span className="max-w-[140px] truncate">{nickname}</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-12 w-44 rounded-2xl border border-black/10 bg-white/90 p-2 shadow-xl backdrop-blur dark:border-white/10 dark:bg-black/70">
          <Link
            href="/me"
            className="block rounded-xl px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            我的
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            onClick={async () => {
              setOpen(false);
              try {
                await fetch("/api/auth/logout", { method: "POST" });
                toast.success("已退出登录");
                setMe(null);
              } catch {
                toast.error("退出失败");
              }
            }}
          >
            <LogOut className="h-4 w-4" />
            退出
          </button>
        </div>
      ) : null}
    </div>
  );
}

